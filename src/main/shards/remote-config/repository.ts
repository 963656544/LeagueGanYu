import { SgpServersConfig } from '@shared/data-sources/sgp'
import { GithubApiFile, GithubApiLatestRelease } from '@shared/types/github'
import axios from 'axios'
import crypto from 'crypto'

export interface RemoteConfigRepositoryConfig {
  locale: 'zh-CN' | 'en'
  source: 'github' | 'gitee'
}

export interface InGameSendTemplateCatalog {
  templates: Array<{
    id: string
    name: string
    type: string
    description: string
    version: number
    path: string
  }>
}

/**
 * 连接到 LeagueAkari/LeagueAkari-Config 或 LeagueAkari/LeagueAkari 仓库
 */
export class RemoteGitRepository {
  private _config = {
    locale: 'zh-CN',
    source: 'github'
  }

  private _http = axios.create({
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0 OPR/105.0.0.0'
    }
  })

  constructor(config: Partial<RemoteConfigRepositoryConfig> = {}) {
    this.setConfig(config)
  }

  /**
   * 获取 API 地址
   */
  private _apiUrl(uri: string, repo: 'akari-config' | 'akari' = 'akari-config') {
    if (uri.startsWith('/')) {
      uri = uri.slice(1)
    }

    if (repo === 'akari-config') {
      if (this._config.source === 'github') {
        return `https://api.github.com/repos/LeagueAkari/LeagueAkari-Config/${uri}`
      }
      return `https://gitee.com/api/v5/repos/LeagueAkari/LeagueAkari-Config/${uri}`
    }

    // main repo → LeagueGanYu
    if (this._config.source === 'github') {
      return `https://api.github.com/repos/963656544/LeagueGanYu/${uri}`
    }
    return `https://gitee.com/api/v5/repos/963656544/LeagueGanYu/${uri}`
  }

  private _rawContentUrl(
    uri: string,
    repo: 'akari-config' | 'akari' = 'akari-config',
    branch = 'main'
  ) {
    if (uri.startsWith('/')) {
      uri = uri.slice(1)
    }

    if (repo === 'akari-config') {
      if (this._config.source === 'github') {
        return `https://raw.githubusercontent.com/LeagueAkari/LeagueAkari-Config/refs/heads/${branch}/${uri}`
      }
      return `https://gitee.com/LeagueAkari/LeagueAkari-Config/raw/${branch}/${uri}`
    }

    // main repo → LeagueGanYu
    if (this._config.source === 'github') {
      return `https://raw.githubusercontent.com/963656544/LeagueGanYu/refs/heads/${branch}/${uri}`
    }
    return `https://gitee.com/963656544/LeagueGanYu/raw/${branch}/${uri}`
  }

  setConfig(config: Partial<RemoteConfigRepositoryConfig>) {
    this._config = {
      ...this._config,
      ...config
    }
  }

  get config() {
    return this._config
  }

  static getGitHubApiFileBase64Content(data: GithubApiFile) {
    const { content, encoding } = data

    if (encoding !== 'base64' || !content) {
      throw new Error('Unsupported encoding format')
    }

    return Buffer.from(content, 'base64').toString('utf-8')
  }

  async getAnnouncement() {
    return this._getLocalAnnouncement()
  }

  private _getLocalAnnouncement() {
    const isZh = this._config.locale === 'zh-CN'
    const content = isZh
      ? `# LeagueGanYu (甘雨)

基于 [League Akari](https://github.com/Hanxven/LeagueAkari) 二次开发的英雄联盟客户端工具箱。

## 新增功能

### QQ 账号管理
一站式管理多个 QQ 账号：账号绑定、封禁查询、段位查询、拖拽排序、状态持久化。

### 其他改进
- 新增应用图标
- 国际化完善（中英文）

## 原版功能
自动接受对局 · 自动选择/禁用英雄 · 自动流程 · 战绩查询 · 英雄选择建议 · 客户端窗口管理 · 自动更新 · 系统托盘

---

> 感谢 [League Akari](https://github.com/Hanxven/LeagueAkari) 及其所有贡献者。
> 项目主页: https://github.com/963656544/LeagueGanYu`
      : `# LeagueGanYu (Ganyu)

A League of Legends client toolbox forked from [League Akari](https://github.com/Hanxven/LeagueAkari).

## New Features

### QQ Account Management
One-stop QQ account management: account binding, ban query, rank query, drag sorting, persistent state.

### Other Improvements
- New app icon
- i18n support (Chinese & English)

## Original Features
Auto accept · Auto pick/ban · Auto gameflow · Match history · Champion suggestions · Client window management · Auto update · System tray

---

> Thanks to [League Akari](https://github.com/Hanxven/LeagueAkari) and all contributors.
> Project: https://github.com/963656544/LeagueGanYu`

    const rawData = `---\nalertLevel: medium\n---\n${content}`
    return {
      content,
      frontMatter: { alertLevel: 'medium' },
      uniqueId: crypto.createHash('md5').update(rawData, 'utf8').digest('hex')
    }
  }

  async getSgpLeagueServersConfig() {
    const { data } = await this._http.get<SgpServersConfig>(
      this._rawContentUrl(`/config/sgp/league-servers.json`)
    )

    return data
  }

  async getInGameSendTemplateCatalog() {
    const { data } = await this._http.get<InGameSendTemplateCatalog>(
      this._rawContentUrl(`/config/in-game-send/templates/catalog.json`)
    )

    return data
  }

  /**
   *
   * @param uri
   * @param repo default is akari-config
   * @param branch default is main
   * @returns
   */
  getRawContent(uri: string, repo: 'akari-config' | 'akari' = 'akari-config', branch = 'main') {
    return this._http.get(this._rawContentUrl(uri, repo, branch))
  }

  getReleases(page = 1, perPage = 20) {
    return this._http.get<GithubApiLatestRelease[]>(this._apiUrl(`/releases`, 'akari'), {
      params: {
        page,
        per_page: perPage
      }
    })
  }

  getLatestRelease() {
    return this._http.get<GithubApiLatestRelease>(this._apiUrl(`/releases/latest`, 'akari'))
  }

  async testGitHubLatency() {
    try {
      const start = Date.now()
      await this._http.head('https://api.github.com', {
        timeout: 2000,
        validateStatus: () => true
      })

      return Date.now() - start
    } catch (error) {
      return -1
    }
  }

  async testGiteeLatency() {
    try {
      const start = Date.now()
      await this._http.head('https://gitee.com/api/v5', {
        timeout: 2000,
        validateStatus: () => true
      })

      return Date.now() - start
    } catch (error) {
      return -1
    }
  }
}
