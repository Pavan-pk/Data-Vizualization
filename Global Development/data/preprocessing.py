import csv
from collections import defaultdict
import json
import os

bank_country = defaultdict(set)
country_bank = defaultdict(str)
with open("countries_regions.csv", "r") as f:
    reader = csv.reader(f, delimiter=",")
    print(next(f))
    for _, row in enumerate(reader):
        bank_country[row[-1]].add(row[-2])
        country_bank[row[-2]] = row[-1]

json_dict = defaultdict(defaultdict)
for country, bank in country_bank.items():
    json_dict[bank][country] = defaultdict(str)

out_file = "curated_data.csv"
with open("global_development.csv", 'r') as f:
    csv_header = ["region", "country", "year", "birth_rate", "death_rate", "fertility_rate",
                  "expectancy_birth_female", "expectancy_birth_male", "expectancy_birth_total",
                  "total_population_growth", "urban_population_percentage", "rural_pop_growth_percentage",
                  "urban_pop_growth_percentage"]
    reader = csv.reader(f)
    x = next(reader)
    print(x)
    write_header = True
    if os.path.exists(out_file):
        write_header = False
    with open(out_file, 'a', newline='') as csv_file_descriptor:
        csv_writer = csv.writer(csv_file_descriptor)
        if write_header:
            csv_writer.writerow(csv_header)
        for _, row in enumerate(reader):
            if row[0] in country_bank and 1980 <= int(row[1]) <= 2013:
                csv_writer.writerow([country_bank[row[0]], row[0], row[1], row[2], row[3], row[4], row[5], row[6],
                                     row[7], row[8], row[23], row[20], row[24]])

with open('data.json', 'w') as f:
    json.dump(json_dict, f)
