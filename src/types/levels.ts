export interface Level {
  level: number
  title: string
  description: string
  hint?: string
}

export interface LevelContent {
  name: string
  title: string
}

export interface LevelNormalized extends Level {
  xpRequired: number
  content?: LevelContent
  unlockedFeatures?: string[]
  lockedMessage?: string
  congratulations?: string
}