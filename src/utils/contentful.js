import { createClient } from 'contentful';

export const contentful = async (params) => {
    const query = {
        limit: 1000,
        include: 10,
        locale: params.locale,
        'fields.slug': params?.slug,
        content_type: params?.pageContentType,
    };

    const client = createClient({
        space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
        accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    });

    const { items: [page] } = await client.getEntries(query);
    console.log(page);
    return page || null;
}

