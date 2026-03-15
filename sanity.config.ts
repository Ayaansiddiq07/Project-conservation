import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schema } from './sanity/schemaTypes'
import { TiltControl } from './sanity/tools/TiltControl'

export default defineConfig({
  basePath: '/admin',
  projectId: 'demo-project-id', // Placeholder, user will need to replace
  dataset: 'production',
  title: 'Project Solar Admin',
  schema,
  plugins: [
    structureTool(),
  ],
  tools: (prev) => {
    return [
      ...prev,
      {
        name: 'tilt-control',
        title: 'Tilt Control',
        icon: () => '✹', // simple icon placeholder
        component: TiltControl,
      },
    ]
  },
})
