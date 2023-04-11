# Summary

* Onkyo TX-NR509 notes server for controlling receiver using Alexa on Raspberry PI
* Version 1.0

## Requirements:  ##
1. To use this make sure you have node.js installed on your pi
2. Certbot installed and certificates generated - [https://certbot.eff.org/#debianwheezy-other](Link URL) (make sure to do this as root)
3. Onkyo receiver protocols to understand commands - [https://www.domoticz.com/wiki/Onkyo](Link URL). Thanks to http://www.domoticz.com
4. Alexa Developer account
5. Open DNS to register your web service
6. Open your firewall to the port where your Onkyo receiver running on your Raspberry PI

## Configuration: ##
* All of the onkyo receiver configurations including command sets are in onkyo.json. 
* App will look for onkyo.local.json first and if it cannot find it, then will try to load default.


## Contact: ##
* Chetan Gopal - cb_gopal@yahoo.com
