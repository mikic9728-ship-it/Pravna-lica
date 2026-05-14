import { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: 'https://rsbi.example.com', lastModified: new Date() }, { url: 'https://rsbi.example.com/compare', lastModified: new Date() }]; }
