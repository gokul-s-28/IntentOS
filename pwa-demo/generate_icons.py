import urllib.request
import os

url_192 = 'https://dummyimage.com/192x192/000/fff.png&text=192x192'
url_512 = 'https://dummyimage.com/512x512/000/fff.png&text=512x512'

urllib.request.urlretrieve(url_192, 'icon-192x192.png')
urllib.request.urlretrieve(url_512, 'icon-512x512.png')

print("Icons generated successfully!")
