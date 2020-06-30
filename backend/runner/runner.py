import sys, os, json, requests, time
from os.path import join, dirname
from dotenv import load_dotenv


BASE_URL = 'https://agsdatacenter.de'
# BASE_URL = 'http://localhost:3000'

dotenv_path = join(dirname(__file__), '../server/.env')
load_dotenv(dotenv_path)
indices = []

def getToken():
    payload = "email=" + os.environ.get('API_EMAIL') + "&password=" + os.environ.get('API_PASSWORD')
    headers = {
        'Content-Type': "application/x-www-form-urlencoded",
        'cache-control': "no-cache",
    }
    response = requests.request("POST", BASE_URL + os.environ.get('API') + '/login', data=payload, headers=headers)
    parsed_json = json.loads(response.text)
    return 'Bearer ' + parsed_json['token']

TOKEN = getToken()

def req(url):
    time.sleep(1.2)

    headers = {'Authorization': TOKEN}
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            time.sleep(1.2)
            response = requests.get(url, headers=headers)
            print('Status code not 200, try again.')
            if response.status_code != 200:
                return False
    except requests.exceptions.ConnectionError:
        print('Connection refused. Try again.')
        time.sleep(60)
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return False
    return response.text

def getWknList():
    response = req(BASE_URL + os.environ.get("API") + '/ags/wknlist')
    response = response.replace('[', '').replace(']', '')
    return [n for n in response.split(',')]

def getProfile(wkn):
    response = req(BASE_URL + os.environ.get("API") + '/ags/profile?wkn=' + wkn + '&' + 'db=true')
    if response != False:
        r = json.loads(response)
        if 'index' in r:
            return r['index']
    return None

def getChronicle(wkn):
    req(BASE_URL + os.environ.get("API") + '/ags/chronicle?wkn=' + wkn + '&' + 'db=true')

def getTrades(wkn):
    req(BASE_URL + os.environ.get("API") + '/ags/trades?wkn=' + wkn + '&' + 'db=true')

def getStatement(wkn):
    req(BASE_URL + os.environ.get("API") + '/ags/statement?wkn=' + wkn + '&' + 'db=true')

def getPortfolio(wkn):
    req(BASE_URL + os.environ.get("API") + '/ags/portfolio?wkn=' + wkn + '&' + 'db=true')

def getOrderbook(wkn):
    req(BASE_URL + os.environ.get("API") + '/ags/orderbook?wkn=' + wkn + '&' + 'db=true')

def getIndex(id):
    req(BASE_URL + os.environ.get("API") + '/ags/index?id=' + id + '&' + 'db=true')

def getWkns(wkn_list):
    response = req(BASE_URL + os.environ.get("API") + '/wkns')
    parsed_json = json.loads(response)

    for comp in parsed_json:
        if comp['wkn'] not in wkn_list:
            wkn_list.append(comp['wkn'])

    return wkn_list

wkn_list = getWknList()

if 'trades' in sys.argv:
    print(len(wkn_list))
    wkn_list = getWkns(wkn_list)
    print(len(wkn_list))

for wkn in wkn_list:

    if 'profile' in sys.argv:
        index = getProfile(wkn)
        if index not in indices and index is not None:
            indices.append(index)

    if 'chronicle' in sys.argv:
        getChronicle(wkn)

    if 'trades' in sys.argv:
        getTrades(wkn)

    if 'portfolio' in sys.argv:
        getPortfolio(wkn)

    if 'statement' in sys.argv:
        getStatement(wkn)

    if 'orderbook' in sys.argv:
        getOrderbook(wkn)

if 'profile' in sys.argv:
    req(BASE_URL + os.environ.get("API") + '/rank')

for index in indices:

    if 'profile' in sys.argv:
        getIndex(index)

print 'executed ' + sys.argv[1]