from flask import Flask, request, jsonify, render_template_string
from flask_sqlalchemy import SQLAlchemy
import requests
from bs4 import BeautifulSoup
import uuid

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///saveit.db"
db = SQLAlchemy(app)


class Archive(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), nullable=False)
    original_url = db.Column(db.String(500), nullable=False)
    archived_url = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(200))
    content = db.Column(db.Text)


@app.route("/archive", methods=["POST"])
def archive():
    data = request.get_json()
    url = data.get("url")
    user_id = request.headers.get("X-User-ID")
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
        title = soup.title.string if soup.title else "No title"
        content = soup.body.get_text() if soup.body else "No content"

        archive_id = str(uuid.uuid4())
        archived_url = f"/archive/{archive_id}"

        new_archive = Archive(
            id=archive_id,
            user_id=user_id,
            original_url=url,
            archived_url=archived_url,
            title=title,
            content=content,
        )
        db.session.add(new_archive)
        db.session.commit()

        return jsonify({"message": "Page archived successfully", "archived_url": archived_url}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to archive page: {str(e)}"}), 500


@app.route("/my-archives/<user_id>", methods=["GET"])
def my_archives(user_id):
    archives = Archive.query.filter_by(user_id=user_id).all()
    return render_template_string(
        """
        <html>
            <head><title>My Archives</title></head>
            <body>
                <h1>My Archives</h1>
                <ul>
                {% for archive in archives %}
                    <li><a href="{{ archive.archived_url }}">{{ archive.title }}</a> - <a href="{{ archive.original_url }}">Original</a></li>
                {% endfor %}
                </ul>
            </body>
        </html>
    """,
        archives=archives,
    )


@app.route("/archive/<id>", methods=["GET"])
def get_archive(id):
    archive = Archive.query.get(id)
    if archive:
        return render_template_string(
            """
            <html>
                <head><title>{{ title }}</title></head>
                <body>
                    <h1>{{ title }}</h1>
                    <p>Original URL: <a href="{{ original_url }}">{{ original_url }}</a></p>
                    <div>{{ content | safe }}</div>
                </body>
            </html>
        """,
            title=archive.title,
            original_url=archive.original_url,
            content=archive.content,
        )
    return jsonify({"error": "Archive not found"}), 404


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
