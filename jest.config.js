import { createDefaultPreset } from 'ts-jest'

const tsJestTransformCfg = createDefaultPreset().transform

export default {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
}
