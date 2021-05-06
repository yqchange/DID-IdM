from web3 import Web3
w3 = Web3(Web3.HTTPProvider('http://localhost:7545'))
if w3.isConnected():
	print("yessss")
else :
	print("noooo")
