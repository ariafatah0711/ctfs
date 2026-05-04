import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const configFilePath = path.join(process.cwd(), 'src/config.ts')
const isProduction = process.env.NODE_ENV === 'production'

type SetupConfig = {
  shortName: string
  fullName: string
  description: string
  flagFormat: string
  baseUrl: string
  challengeCategories: string[]
  notifSolves: boolean
  challengeTutorial: boolean
  chatBotAI: boolean
  live2dMaskotAnime: boolean
  teamsEnabled: boolean
  hideScoreboardIndividual: boolean
  hideScoreboardTotal: boolean
  hideEventMain: boolean
  eventMainLabel: string
  eventMainImageUrl: string
  maintenanceMode: 'no' | 'yes' | 'auto'
  maintenanceMessage: string
}

function toJsonString(value: string) {
  return JSON.stringify(value)
}

function readString(source: string, pattern: RegExp, fallback = '') {
  const match = source.match(pattern)
  return match?.[1] ?? fallback
}

function readBoolean(source: string, pattern: RegExp, fallback = false) {
  const match = source.match(pattern)
  if (!match?.[1]) return fallback
  return match[1].trim() === 'true'
}

function readCategories(source: string) {
  const match = source.match(/challengeCategories:\s*\[([\s\S]*?)\n\s*\],/)
  if (!match) return []

  return Array.from(match[1].matchAll(/['"]([^'"]+)['"]/g)).map((item) => item[1])
}

function readConfig(source: string): SetupConfig {
  const teamsBlock = source.match(/teams:\s*\{([\s\S]*?)\n\s*\},/)
  const maintenanceBlock = source.match(/maintenance:\s*\{([\s\S]*?)\n\s*\},/)

  return {
    shortName: readString(source, /shortName:\s*['"]([^'"]*)['"]/),
    fullName: readString(source, /fullName:\s*['"]([^'"]*)['"]/),
    description: readString(source, /description:\s*['"]([^'"]*)['"]/),
    flagFormat: readString(source, /flagFormat:\s*['"]([^'"]*)['"]/),
    baseUrl: readString(
      source,
      /baseUrl:\s*[\r\n\s]*process\.env\.NEXT_PUBLIC_SITE_URL \|\| ['"]([^'"]*)['"]/,
    ),
    challengeCategories: readCategories(source),
    notifSolves: readBoolean(source, /notifSolves:\s*(true|false)/),
    challengeTutorial: readBoolean(source, /ChallengeTutorial:\s*(true|false)/),
    chatBotAI: readBoolean(source, /ChatBotAI:\s*(true|false)/),
    live2dMaskotAnime: readBoolean(source, /Live2DMaskotAnime:\s*(true|false)/),
    teamsEnabled: readBoolean(teamsBlock?.[1] || '', /enabled:\s*(true|false)/),
    hideScoreboardIndividual: readBoolean(teamsBlock?.[1] || '', /hideScoreboardIndividual:\s*(true|false)/),
    hideScoreboardTotal: readBoolean(teamsBlock?.[1] || '', /hidescoreboardTotal:\s*(true|false)/),
    hideEventMain: readBoolean(source, /hideEventMain:\s*(true|false)/),
    eventMainLabel: readString(source, /eventMainLabel:\s*['"]([^'"]*)['"]/),
    eventMainImageUrl: readString(source, /eventMainImageUrl:\s*['"]([^'"]*)['"]/),
    maintenanceMode: (readString(
      maintenanceBlock?.[1] || '',
      /mode:\s*process\.env\.NEXT_PUBLIC_MAINTENANCE_MODE \|\| ['"]([^'"]*)['"]/,
      'no'
    ) as SetupConfig['maintenanceMode']),
    maintenanceMessage: readString(
      source,
      /process\.env\.NEXT_PUBLIC_MAINTENANCE_MESSAGE \|\|\s*['"]([^'"]*)['"]/,
    ),
  }
}

function replaceFirst(source: string, pattern: RegExp, replacement: string) {
  if (!pattern.test(source)) return source
  return source.replace(pattern, () => replacement)
}

function updateConfig(source: string, config: SetupConfig) {
  let updated = source

  updated = replaceFirst(updated, /shortName:\s*['"][^'"]*['"]/, `shortName: ${toJsonString(config.shortName)}`)
  updated = replaceFirst(updated, /fullName:\s*['"][^'"]*['"]/, `fullName: ${toJsonString(config.fullName)}`)
  updated = replaceFirst(updated, /description:\s*['"][^'"]*['"]/, `description: ${toJsonString(config.description)}`)
  updated = replaceFirst(updated, /flagFormat:\s*['"][^'"]*['"]/, `flagFormat: ${toJsonString(config.flagFormat)}`)
  updated = replaceFirst(
    updated,
    /baseUrl:\s*[\r\n\s]*process\.env\.NEXT_PUBLIC_SITE_URL \|\| ['"][^'"]*['"]/,
    `baseUrl:\n    process.env.NEXT_PUBLIC_SITE_URL || ${toJsonString(config.baseUrl)}`
  )

  const categoriesBlock = config.challengeCategories.length
    ? `challengeCategories: [\n${config.challengeCategories
        .map((category) => `    ${toJsonString(category)}`)
        .join(',\n')}\n  ],`
    : 'challengeCategories: [],'

  updated = replaceFirst(
    updated,
    /challengeCategories:\s*\[([\s\S]*?)\n\s*\],/,
    categoriesBlock
  )

  updated = replaceFirst(updated, /notifSolves:\s*(true|false)/, `notifSolves: ${config.notifSolves}`)
  updated = replaceFirst(updated, /ChallengeTutorial:\s*(true|false)/, `ChallengeTutorial: ${config.challengeTutorial}`)
  updated = replaceFirst(updated, /ChatBotAI:\s*(true|false)/, `ChatBotAI: ${config.chatBotAI}`)
  updated = replaceFirst(updated, /Live2DMaskotAnime:\s*(true|false)/, `Live2DMaskotAnime: ${config.live2dMaskotAnime}`)
  updated = replaceFirst(
    updated,
    /teams:\s*\{([\s\S]*?)\n\s*\},/,
    `teams: {\n    enabled: ${config.teamsEnabled},\n    hideScoreboardIndividual: ${config.hideScoreboardIndividual},\n    hidescoreboardTotal: ${config.hideScoreboardTotal},\n  },`
  )
  updated = replaceFirst(updated, /hideEventMain:\s*(true|false)/, `hideEventMain: ${config.hideEventMain}`)
  updated = replaceFirst(updated, /eventMainLabel:\s*['"][^'"]*['"]/, `eventMainLabel: ${toJsonString(config.eventMainLabel)}`)
  updated = replaceFirst(updated, /eventMainImageUrl:\s*['"][^'"]*['"]/, `eventMainImageUrl: ${toJsonString(config.eventMainImageUrl)}`)
  updated = replaceFirst(
    updated,
    /mode:\s*process\.env\.NEXT_PUBLIC_MAINTENANCE_MODE \|\| ['"][^'"]*['"]/,
    `mode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE || ${toJsonString(config.maintenanceMode)}`
  )
  updated = replaceFirst(
    updated,
    /process\.env\.NEXT_PUBLIC_MAINTENANCE_MESSAGE \|\|\s*['"][^'"]*['"]/,
    `process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || ${toJsonString(config.maintenanceMessage)}`
  )

  return updated
}

function normalizeConfig(input: Partial<SetupConfig>): SetupConfig {
  return {
    shortName: input.shortName?.trim() || '',
    fullName: input.fullName?.trim() || '',
    description: input.description?.trim() || '',
    flagFormat: input.flagFormat?.trim() || '',
    baseUrl: input.baseUrl?.trim() || '',
    challengeCategories: Array.isArray(input.challengeCategories)
      ? input.challengeCategories.map((item) => item.trim()).filter(Boolean)
      : [],
    notifSolves: Boolean(input.notifSolves),
    challengeTutorial: Boolean(input.challengeTutorial),
    chatBotAI: Boolean(input.chatBotAI),
    live2dMaskotAnime: Boolean(input.live2dMaskotAnime),
    teamsEnabled: Boolean(input.teamsEnabled),
    hideScoreboardIndividual: Boolean(input.hideScoreboardIndividual),
    hideScoreboardTotal: Boolean(input.hideScoreboardTotal),
    hideEventMain: Boolean(input.hideEventMain),
    eventMainLabel: input.eventMainLabel?.trim() || '',
    eventMainImageUrl: input.eventMainImageUrl?.trim() || '',
    maintenanceMode: input.maintenanceMode === 'yes' || input.maintenanceMode === 'auto' ? input.maintenanceMode : 'no',
    maintenanceMessage: input.maintenanceMessage?.trim() || '',
  }
}

export async function GET() {
  if (isProduction) {
    return NextResponse.json({ ok: false, error: 'Config editor is disabled in production.' }, { status: 404 })
  }

  try {
    const source = await fs.readFile(configFilePath, 'utf8')
    return NextResponse.json({ ok: true, config: readConfig(source) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read src/config.ts'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (isProduction) {
    return NextResponse.json({ ok: false, error: 'Config editor is disabled in production.' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as Partial<SetupConfig>
    const config = normalizeConfig(body)
    const source = await fs.readFile(configFilePath, 'utf8')
    const updated = updateConfig(source, config)

    await fs.writeFile(configFilePath, updated, 'utf8')

    return NextResponse.json({ ok: true, config: readConfig(updated) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update src/config.ts'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
