export interface SEOProps {
  title?: string;
  description?: string;
  lang?: string;
  meta?: any[];
  author?: string;
}

export interface SEOQuery {
  site: {
    siteMetadata: SEOProps;
  };
}
