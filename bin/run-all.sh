
catalog="$PWD/catalogs/sparql-endpoints.ttl"
queries=`ls $PWD/queries/*.rq`
for query in $queries
do
   query_name=$(basename $query .rq)
   query_file="$PWD/queries/$query_name.rq"
   output_file="$PWD/output/$query_name.nt"
   log_file="$PWD/output/$query_name.log"
   echo "Working on $query_name..." 
   $PWD/bin/dev analyze-endpoints --catalogFile $catalog --queryFile $query_file > $output_file 2> $log_file
done
