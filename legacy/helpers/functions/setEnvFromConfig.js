import config from 'config-yml'

function setEnvFromConfig () {
  const conf = config.load(process.env.STAGE)
  Object.keys(conf).filter(key => !['default', 'dev', 'stage', 'prod'].includes(key)).map(key => {
    if (!process.env[key] && conf[key]) process.env[key] = conf[key]
  })
}

setEnvFromConfig()
