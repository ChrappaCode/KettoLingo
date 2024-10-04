from app import app, db
from models import Category


def insert_categories():
    categories = ['Clothing', 'Animals', 'Family', 'Colors', 'Numbers', 'Household', 'Travel', 'Restaurant', 'Food', 'Sport']

    for cat in categories:
        existing_cat = Category.query.filter_by(name=cat).first()
        if not existing_cat:
            new_category = Category(name=cat)
            db.session.add(new_category)
            print(f"Inserted {cat} into the database.")

    db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        insert_categories()
        print("Categories inserted successfully.")
