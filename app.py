"""
HOG-U Web Dashboard - Display meal recommendations in a web UI
"""

from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
from hogu_strava_integration import (
    run_automated_hogu, get_valid_access_token, 
    get_recent_activities, process_strava_activity
)
import os

app = Flask(__name__)

@app.route('/')
def index():
    """Home page with latest recommendations."""
    if os.path.exists('hogu_recommendations.json'):
        with open('hogu_recommendations.json', 'r') as f:
            recommendations = json.load(f)
    else:
        recommendations = []
    
    return render_template('index.html', recommendations=recommendations)

@app.route('/api/refresh', methods=['POST'])
def refresh_data():
    """Endpoint to manually refresh meal recommendations."""
    try:
        results = run_automated_hogu(prefer_local=True, limit=10)
        return jsonify({
            "status": "success",
            "message": f"Generated recommendations for {len(results)} activities",
            "results": results
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/activities', methods=['GET'])
def get_activities():
    """API endpoint to get all cached recommendations."""
    if os.path.exists('hogu_recommendations.json'):
        with open('hogu_recommendations.json', 'r') as f:
            return jsonify(json.load(f))
    return jsonify([])

if __name__ == '__main__':
    print("\n🚀 Starting HOG-U Web Dashboard")
    print("📱 Open http://192.168.1.21:5000 on your device")
    app.run(debug=False, use_reloader=False, host='0.0.0.0', port=5000, threaded=True)
