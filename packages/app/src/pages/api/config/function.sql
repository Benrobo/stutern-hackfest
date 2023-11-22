-- Postgres function meant for getting similar embeddings
-- The prisma query is meant to return json rather than table as it isn't supported yet.

-- Drop function
DROP FUNCTION IF EXISTS match_embeddings;
-- Create function
CREATE OR REPLACE FUNCTION match_embeddings (
  query_embedding text,
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  result json
)
LANGUAGE SQL STABLE
AS $$
  SELECT json_build_object(
    'id', public."Datasource".id,
    'content', string_to_array(public."Datasource".content, '.'),
    'metadata', public."DatasourceMetaData".metadata::json,
    'similarity', 1 - (public."Datasource".embedding <=> query_embedding::vector)
  ) AS result
  FROM
    public."Datasource"
  INNER JOIN
    public."DatasourceMetaData" ON public."Datasource".id = public."DatasourceMetaData".data_source_id
  WHERE
    1 - (public."Datasource".embedding <=> query_embedding::vector) > match_threshold
  ORDER BY
    1 - (public."Datasource".embedding <=> query_embedding::vector) DESC
  LIMIT
    match_count;
$$;
