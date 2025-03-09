
# UNCOMMENT TO PRODUCE ROUTING DATA FOR MOBILE APP
#java -D"dw.graphhopper.datareader.file=philippines-latest-2.osm.pbf" -jar graphhopper-web-1.0.jar server config-web-1.0.yml

# COMMENT WHEN PRODUCING ROUTING DATA FOR MOBILE APP
# java -D"dw.graphhopper.datareader.file=philippines-latest-2.osm.pbf" -jar graphhopper-web-10.0.jar server config-web-10.0-v1.yml


# FINAL 
#java -D"dw.graphhopper.datareader.file=philippines-latest-2.osm.pbf" -jar graphhopper-web-10.0.jar server config-web-10.0-v1.yml

java -D"dw.graphhopper.datareader.file=philippines-latest-2.osm.pbf" -jar graphhopper-web-10.0.jar server config-web-10.0-v1.yml
