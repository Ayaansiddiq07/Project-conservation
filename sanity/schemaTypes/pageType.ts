import { defineType, defineField } from 'sanity'

export const pageType = defineType({
  name: 'page',
  title: 'Website Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Page Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
})
