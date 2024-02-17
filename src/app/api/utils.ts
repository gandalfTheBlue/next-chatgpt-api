function GetEnv(name: string) {
  return process.env[name] || ''
}

const EnvKey = {
  openAiApiKey: 'OPENAI_API_KEY',
}

export { EnvKey, GetEnv }
