# Test Scripts
This folder contains the scripts used for testing the device's various hardware

## GPS
The device uses an ATGM336H GPS module. Two tests were performed, TTFF and Accuracy

### Time-to-First-Fix
TTFF is the time elapsed before the GPS manages to return valid positional data.

##### Cold Start
* GPS was booted more than 2 hours, booted for the first time or the GPS module has moved too far from its last position in the last shutdown, ephemeris data is invalid and flushed, the GPS module will take some time to regain valid ephemeris data. This can also be manually triggered by configuring the GPS to flush all of its ephemeris data.

##### Warm Start
* GPS was booted less than 2 hours after its last shutdown. The ephemeris data in its flash memory is still valid and can be used to gain valid positional data much more quickly. 

### Test
