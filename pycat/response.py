import sys
import json
from catsim.estimation import HillClimbingEstimator
from catsim.cat import generate_item_bank


param = json.loads(sys.argv[1])
items = param['items']
item_bank = generate_item_bank(len(items), '1PL')

for i in range(len(items)):
    item_bank[i][1] = items[i]['difficulty']

print(HillClimbingEstimator().estimate(
    items=item_bank, administered_items=param['administered_items'], response_vector=param['response_vector'], est_theta=param['est_theta']), end='')
