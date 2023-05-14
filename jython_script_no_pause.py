# This jython2.7 script has to be executed as jython, not GREL
# It allows you to execute a command (CLI) in the terminal and retrieve the result.

# import basic librairies
import time
import commands
import random
# get status and output of the command
status, output = commands.getstatusoutput(value)
# add a random between 2 and 5s pause to avoid ddos on servers... Be kind to APIs!
#time.sleep(random.randint(2, 5))
# returns the result of the command
return output.decode("utf-8")
