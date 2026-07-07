import data from './blogPosts.json';

export interface BlogPost {
 slug: string;
 title: string;
 description: string;
 date: string;
 year?: number;
 category: string;
 tags: string[];
 banner: string;
 iso_date?: string;
}

export const blogPosts: BlogPost[] = data as BlogPost[];

export const categories = [...new Set(blogPosts.map(p => p.category))];
