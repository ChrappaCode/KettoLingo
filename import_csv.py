import csv
import os
from app import app  # Import the Flask app instance
from models import db, Category, Word

# Define the path to the folder containing your CSVs
csv_folder = "./words_csv"

# A mapping of category names to file names
categories = {
    'Clothing': 'clothing.csv',
    'Animals': 'animals.csv',
    'Family': 'family.csv',
    'Colors': 'colors.csv',
    'Numbers': 'numbers.csv',
    'Household': 'household.csv',
    'Travel': 'travel.csv',
    'Restaurant': 'restaurant.csv',
    'Food': 'food.csv',
    'Sport': 'sport.csv'
}

def import_words_from_csv():
    # Loop through each category and corresponding CSV file
    for category_name, csv_file in categories.items():
        # Check if category already exists, if not, create it
        category = Category.query.filter_by(name=category_name).first()
        if not category:
            category = Category(name=category_name)
            db.session.add(category)
            db.session.commit()

        # Open the CSV file
        csv_path = os.path.join(csv_folder, csv_file)
        with open(csv_path, mode='r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # Insert each word into the database
                new_word = Word(
                    category_id=category.id,
                    english=row['English'],
                    hungarian=row['Hungarian'],
                    german=row['German'],
                    slovak=row['Slovak'],
                    czech=row['Czech'],
                    italian=row['Italian']
                )
                db.session.add(new_word)
            # Commit all words for this category
            db.session.commit()

if __name__ == '__main__':
    # Use the Flask app context
    with app.app_context():
        # Import words from all CSV files
        import_words_from_csv()
        print("CSV import completed.")
