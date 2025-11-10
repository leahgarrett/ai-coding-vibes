import csv
import json
from pathlib import Path

def read_csv_to_dict(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return list(csv.DictReader(f))

def main():
    data_dir = Path('data')
    
    # Read all data files
    films = {f['film']: dict(f) for f in read_csv_to_dict(data_dir / 'pixar_films.csv')}
    box_office = {f['film']: f for f in read_csv_to_dict(data_dir / 'box_office.csv')}
    academy = {f['film']: f for f in read_csv_to_dict(data_dir / 'academy.csv')}
    genres = {}
    
    # Group genres by film
    for item in read_csv_to_dict(data_dir / 'genres.csv'):
        if item['category'] == 'Genre':
            if item['film'] not in genres:
                genres[item['film']] = []
            genres[item['film']].append(item['value'])
    
    # Combine all data
    combined = []
    for film_name, film_data in films.items():
        film_entry = {
            **film_data,
            'genres': genres.get(film_name, []),
            'box_office': box_office.get(film_name, {}),
            'academy_awards': academy.get(film_name, {})
        }
        combined.append(film_entry)
    
    # Write to JSON file
    output_file = data_dir / 'pixar_movies_combined.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(combined, f, indent=2)
    
    print(f"Successfully combined data into {output_file}")

if __name__ == '__main__':
    main()
