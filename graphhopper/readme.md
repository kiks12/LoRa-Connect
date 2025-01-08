# Getting Started

http://localhost:8989/route?point=lat,lng&point=lat,lng&profile=car

where:

1. point - Specify multiple points for which the route should be calculated. The order is important. Specify at least two points.

2. locale - The locale of the resulting turn instructions. E.g. pt_PT for Portuguese or de for German (default: en)

3. instructions - If instruction should be calculated and returned (default: true)

4. profile = The profile to be used for the route calculation. (i.e. car)

>[!TIP]
>refer to https://github.com/graphhopper/graphhopper/blob/master/docs/web/api-doc.md
