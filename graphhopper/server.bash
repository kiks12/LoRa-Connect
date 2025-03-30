
# UNCOMMENT TO PRODUCE ROUTING DATA FOR MOBILE APP
# java -D"dw.graphhopper.datareader.file=philippines-latest-2.osm.pbf" -jar graphhopper-web-1.0.jar server config-web-1.0.yml

# FINAL 
java -D"dw.graphhopper.datareader.file=philippines-latest-2.osm.pbf" -jar graphhopper-web-10.0.jar server config-web-10.0-v1.yml

# FOR TESTING 
# java -D"dw.graphhopper.datareader.file=philippines-latest-2.osm.pbf" -jar graphhopper-web-10.0.jar server config-web-10.0-v2.yml
