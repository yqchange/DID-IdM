from web3 import Web3
import json
import rsa
import time
#import ipfshttpclient
import requests
# web3.py instance
# self.w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

class pubPrivKey():
    def __init__(self):
        #create keypair
        (pubkey, privkey) = rsa.newkeys(1024)
        pub = pubkey.save_pkcs1()
        pri = privkey.save_pkcs1()
        #store keys
        with open("public.pem", 'w+') as file:  # public.pub，保存的文件名，可更改路径，这里保存在当前路径下
            file.write(pub.decode("utf-8"))

        with open("private.pem", 'w+') as file:
            file.write(pri.decode('utf-8'))

        # load keys
        with open("public.pem", "r") as file_pub:
            # 从文件中读出数据
            pub_data = file_pub.read()
            # 将读出数据通过PublicKey.load_pkcs1()转换为公钥
            pubkey = rsa.PublicKey.load_pkcs1(pub_data)
        # 取出私钥
        with open("private.pem", "r") as file_pri:
            pri_data = file_pri.read()
            # 将读出数据通过PrivateKey.load_pkcs1()转换为私钥
            prikey = rsa.PrivateKey.load_pkcs1(pri_data)
        
        # 用公钥加密、再用私钥解密
        message = 'hello dear xiaoMing!'.encode('utf-8')
        crypto = rsa.encrypt(message, pubkey)
        print('加密后', crypto)
        message = rsa.decrypt(crypto, privkey)
        print(message.decode('utf-8'))

        # message = 'hello dear xiaoMing!'.encode('utf-8')
        # print('pubkey!:' , self.pubkey)
        # print(self.pubkey.e, self.pubkey.n)
        # print('privkey!:' , self.privkey)
        # crypto = rsa.encrypt(message,  self.pubkey)
        # print(message, 'end', crypto)
        # message = rsa.decrypt(crypto, self.privkey)
        # print(message.decode('utf8'))

class IPFSApiClient():
    def __init__(self, host="http://127.0.0.1:5001"):
        self.__host = host
        self.__upload_url = self.__host + "/api/v0/add"
        self.__cat_url = self.__host + "/api/v0/cat"
        self.__version_url = self.__host + "/api/v0/version"
        self.__options_request()
 
    def __options_request(self):
        """
        测试请求是否可以连通
        :return:
        """
        try:
            requests.post(self.__version_url, timeout=10)
        except requests.exceptions.ConnectTimeout:
            raise SystemExit("连接超时，请确保已开启 IPFS 服务")
        except requests.exceptions.ConnectionError:
            raise SystemExit("无法连接至 %s " % self.__host)
 
    def upload_file(self, file_path):
        try:
            file = open(file_path, mode='rb')
        except FileNotFoundError:
            raise FileExistsError("文件不存在！")
 
        files = {
            'file': file
        }
        response = requests.post(self.__upload_url, files=files)
        if response.status_code == 200:
            data = json.loads(response.text)
            hash_code = data['Hash']
        else:
            hash_code = None
 
        return hash_code
 
    def cat_hash(self, hash_code):
        """
        读取文件内容
        :param hash_code:
        :return:
        """
        params = {
            'arg': hash_code
        }
        response = requests.post(self.__cat_url, params=params)
        if response.status_code == 200:
            return response.text        #return response.text.decode("utf-8")
        else:
            return "未获取到数据！"
 
    def download_hash(self, hash_code, save_path):
        """
        读取文件内容
        :param hash_code:
        :param save_path:  文件保存路径
        :return:
        """
        params = {
            'arg': hash_code
        }
        response = requests.post(self.__cat_url, params=params)
        if response.status_code == 200:
            with open(save_path, mode='wb') as f:
                f.write(response.content)
            return True, '保存成功'
        else:
            return False, "未获取到数据！"

class ethereumHandler():
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
        if self.w3.eth.getBlock(0) is None:
            print("Failed to connect!")
        elif self.w3.isConnected():
            compiled_contract_path = '/Users/yangqingqing/Documents/ReactDemo/IdM/client/src/contracts/Logistics.json'
            self.deployed_contract_address = '0x74f836F683471c453eAA0245c3c3e2D31dC30943'
            with open(compiled_contract_path) as file:
                contract_json = json.load(file)  # load contract info as JSON
                contract_abi = contract_json['abi']  # fetch contract's abi - necessary to call its functions
                self.contract = self.w3.eth.contract(address=self.deployed_contract_address, abi=contract_abi)
                print("Successfully connected")
            #print(contract.all_functions())

            num = self.contract.functions.getOrderCount().call()
            print('number of orders:', num)

    def CreateOrder(self,_from,_to,_class,_time):
        tx_hash = self.contract.functions.createOrder(_from,_to,_class,_time).transact({
            'from': '0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5'
        })

        receipt = self.w3.eth.waitForTransactionReceipt(self.w3.toHex(tx_hash))
        logs = self.CreateOrderLog(receipt)
        if len(logs) == 0:
           return False
        print('new order logs=>:{0}'.format(logs[0]['args']))

        #self.setPubKeyOnChain()
        print('Pubkey set success!', self.pubkey)
        #return logs[0]['args']

        #return self.w3.toHex(tx_hash)

    def CreateOrderLog(self,_receipt):
        rich_logs = self.contract.events.UpdateorderStatus().processReceipt(_receipt)
        return rich_logs

    def sendUUID(self, _uuid):
        tx_hash = self.contract.functions.confirmOrder(_uuid).transact({
            'from': '0xFe941a539EBa7E60071D83EfE71044C2f9FC0C1A'
        })
        receipt = self.w3.eth.waitForTransactionReceipt(self.w3.toHex(tx_hash))
        logs = self.ConfirmOrderLog(receipt)
        if len(logs) == 0:
           return False
        print('new order logs=>:{0}'.format(logs[0]['args']))

    def ConfirmOrderLog(self,_receipt):
        rich_logs = self.contract.events.sendUUID().processReceipt(_receipt)
        return rich_logs

    def setPubkeyOnChain(self, _hash):
        tx_hash = self.contract.functions.setPubkey(_hash).transact({
            'from': '0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5'
        })
        print('set pubkey onchain!!')
        return self.w3.toHex(tx_hash)
    
    def creatOrderListenning(self,event_filter,poll_interval):
        while True:
            for event in event_filter.get_new_entries():
                self.handle_event(event)
                print("监听事件:",event)
            time.sleep(poll_interval)
    
    def handle_event(self, event):
        receipt = self.w3.eth.waitForTransactionReceipt(event['transactionHash'])
        result = self.contract.events.UpdateorderStatus().processReceipt(receipt)
        print(result[0]['args'])

    def sendUUIDListenning(self,event_filter,poll_interval):
        while True:
            for event in event_filter.get_new_entries():
                self.handle_send_event(event)
                #print("监听事件:",event)
            time.sleep(poll_interval)

    def handle_send_event(self, event):
        receipt = self.w3.eth.waitForTransactionReceipt(event['transactionHash'])
        result = self.contract.events.sendUUID().processReceipt(receipt)
        #print(result[0]['args'])
        return result[0]['args']

    def fetch_Cred(self, _add, _uuid):
        fetch = _add
    # def log_loop(self, event_filter, poll_interval):
    #     while True:
    #         for event in event_filter.get_new_entries():
    #             handle_event(event)
    #             time.sleep(poll_interval)
    # def test(self):
    #     block_filter = self.w3.eth.filter({'fromBlock':'latest', 'address':self.deployed_contract_address})
    #     self.log_loop(block_filter, 2)

if __name__ == "__main__":  
    # key = pubPrivKey() 
    # client = IPFSApiClient()

    # hash = client.upload_file('/Users/yangqingqing/Documents/ReactDemo/IdM/client/src/offchain/public.pem')
    # #print(hash)
    # print(client.cat_hash(hash)

    eth = ethereumHandler()
    eth.setPubkeyOnChain(hash)
    # event_filter = e1.contract.events.UpdateorderStatus.createFilter(fromBlock="latest",
    #                 argument_filters={
    #                 'orderStatus': 'Created'
    #                 })
    # e1.creatOrderListenning(event_filter,3)
    #e1.sendUUID('0xfe3b15d93178f560cc06999ca6fd47a7c41bbe863ff0baefaaaf8141ef86b6eb')
    event_filter_UUID = e1.contract.events.sendUUID.createFilter(fromBlock="latest",
                    argument_filters={
                    })

    e1.sendUUIDListenning(event_filter_UUID,1)
    print(result)
    #e1.CreateOrder('a', 'b', int(1), int(1))

#e1.setPubKeyOnChain()