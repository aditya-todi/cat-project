import sys
import json
from catsim.selection import MaxInfoSelector
from catsim.cat import generate_item_bank

# print(sys.argv[1])
param = json.loads(sys.argv[1])
items = param['items']
item_bank = generate_item_bank(len(items), '1PL')

for i in range(len(items)):
    item_bank[i][1] = items[i]['difficulty']

print(items[MaxInfoSelector().select(items=item_bank,
                                     administered_items=param['administered_items'], est_theta=param['est_theta'])]['id'], end='')
