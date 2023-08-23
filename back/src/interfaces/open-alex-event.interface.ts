export interface InstitutionOpenAlex {
  country_code: string;
  display_name: string;
  id: string;
  ror: string;
  type: string;
}

export interface AuthorOpenAlex {
  author: {
    display_name: string;
    id?: string;
    orcid?: string;
  };
  author_position?: string;
  institutions?: InstitutionOpenAlex[];
  raw_affiliation_string?: string;
}

export interface ConceptOpenAlex {
  display_name: string;
  id?: string;
  level?: number;
  score?: string;
  wikidata: string;
}

export interface WorkIdsOpenAlex {
  doi: string;
  mag: string;
  openalex: string;
}

export interface JornalOpenAlex {
  is_oa?: boolean;
  landing_page_url?: string;
  pdf_url?: string;
  source?: {
    id: string;
    display_name: string;
    issn_l?: string;
    issn?: string[];
    host_organization?: string;
    type?: string;
  };
  venue?: {
    display_name?: string;
    issn?: string[];
  };
}

export interface OpenAccessOpenAlex {
  is_oa?: boolean;
  oa_status?: string;
  oa_url?: string | null;
}

export interface Biblio {
  first_page: string;
  issue: string;
  last_page: string;
  volume: string;
}

export interface ResultsOpenAlex {
  authorships: AuthorOpenAlex[];
  cited_by_api_url: string;
  cited_by_count: number;
  concepts: ConceptOpenAlex[];
  display_name: string;
  doi: string;
  ids: WorkIdsOpenAlex;
  open_access?: OpenAccessOpenAlex;
  publication_date: string;
  publication_year: number;
  referenced_works: string[];
  related_works: string[];
  title: string;
  type?: string;
  primary_location?: JornalOpenAlex;
  hIndex?: string;
  institution_id?: string;
  biblio?: Biblio;
  language?: string;
}

export interface MetaOpenAlex {
  count: number;
  number_of_pages: number;
  page: number;
  per_page: number;
}

export interface WorksOpenAlex {
  meta: MetaOpenAlex;
  results: ResultsOpenAlex[];
}
