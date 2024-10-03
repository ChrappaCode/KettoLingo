from app import app, db
from models import Language


def insert_languages():
    languages = ['English', 'Hungarian', 'German', 'Slovak', 'Czech', 'Italian']

    for lang in languages:
        existing_lang = Language.query.filter_by(name=lang).first()
        if not existing_lang:
            new_language = Language(name=lang)
            db.session.add(new_language)
            print(f"Inserted {lang} into the database.")

    db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        insert_languages()
        print("Languages inserted successfully.")
