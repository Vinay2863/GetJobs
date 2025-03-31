from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from pymongo import MongoClient, errors
import google.generativeai as genai
import json


import time  
from selenium import webdriver
from selenium.webdriver.chrome.service import Service  
from selenium.webdriver.chrome.options import Options

# Set up Chrome options
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# Selenium Grid URL (inside Docker network)
SELENIUM_REMOTE_URL = "http://selenium:4444/wd/hub"

# Initialize WebDriver with Remote Selenium
driver = webdriver.Remote(
    command_executor=SELENIUM_REMOTE_URL,
    options=chrome_options
)

# Test: Open Google
driver.get("https://www.google.com")

# Print the page title
print(driver.title)

app = Flask(__name__)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, cors_allowed_origins="*")
#uri = "mongodb+srv://suryatejaaiproject:ZgQ7ACyPHcVUyHW2@cluster0.atwu66p.mongodb.net/"
uri = "mongodb+srv://vinaysunkara:vinaysunkara@cluster0.snpbn.mongodb.net/?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true"
global ans
ans = ""

try:
    client = MongoClient(uri)
    client.admin.command('ismaster')
    print("Connected to the database successfully.")
except errors.ConnectionFailure:
    print("Failed to connect to the database.")

db = client['RealTimeDataAnalysiss']

collection_name = "applied_jobs"
if collection_name not in db.list_collection_names():
    db.create_collection(collection_name)
    print(f"Collection '{collection_name}' created.")

users_collection = db['profiles_ind']
recruiter_check_collection = db['checklist']
recruiter_collection = db['recruiters']
jobs = db['companies']
appliedjobs_collection = db[collection_name]

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    # print(data)

    # Retrieve form data
    firstname = data.get('first_name')
    lastname = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    role = data.get('role')  # Fetch the role from the request

    # Additional fields for recruiter
    
    # Check if the email already exists
    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 409

    # Hash the password
    password_hash = password

    # Create common user data with role
    user_data = {
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': password_hash,
        'role': role
    }

    # Role-based logic: If recruiter, add to Check_list; if user, add to UsersDetails
    if role == 'recruiter':
        company_name = data.get('company_name')
        recruiter_id = data.get('id')
        
        print(firstname,lastname)
        if not company_name or not recruiter_id:
            return jsonify({'error': 'Company name and ID are required for recruiters'}), 400

        # Insert recruiter details into Check_list collection
        user_data = {
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': password_hash,
        'role': role,
        'company_name': company_name,
        'recruiter_id': recruiter_id,
    }
      
        recruiter_check_collection.insert_one(user_data)  # Insert recruiter into Check_list

    elif role == 'user':
        # Insert user details into UsersDetails collection
        user_data = {
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': password_hash,
        'role': role
    }
        users_collection.insert_one(user_data)  # Insert user into UsersDetails

    # Insert the common user data into the users collection

    return jsonify({'message': 'User created successfully'}), 201


@app.route('/get_degree', methods=['GET'])
def get_degree():
    data = request.get_json()
    email = data.get('email')

    user = users_collection.find_one({'email': email})
    if not user or 'education' not in user or not isinstance(user['education'], list) or len(user['education']) == 0:
        return jsonify({"error": "No degree information found"}), 404

    degree = user['education'][0].get('degree', "")
    return jsonify({"degree": degree})



global_mail=""
@app.route('/login', methods=['POST'])
def login():
    global global_mail
    data = request.get_json()
    email = data.get('mail')
    global_mail = email
    password = data.get('password')
    role = data.get('role')  # Retrieve the role from the request
    
    if role=="admin":
        return jsonify({'message': 'Login successful', 'user': {'role': "admin"}}), 200
        

    print(data)
    
   
    
    # Check if email, password, and role are provided
    if not email or not password or not role:
        return jsonify({'error': 'email, password, and role are required'}), 400
    
    
    # Find the user by email
    if role=="user":
        user = users_collection.find_one({'email': email})
    elif role=="recruiter":
        user = recruiter_collection.find_one({'email': email})
    
    # Check if the user exists, if password is correct, and if the role matches
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user['password']==password:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # if user.get('role') != role:  # Check if the role matches
    #     return jsonify({'error': f'Invalid role: expected {user.get("role")}, got {role}'}), 403

    # Login successful
    return jsonify({
        'message': 'Login successful', 
        'user': {
            'firstname': user['firstname'], 
            'lastname': user['lastname'], 
            'email': user['email'], 
            'role': role  
        }
    }), 200
    
    
    
    

def convert_objectid(user):
    if user and '_id' in user:
        user['_id'] = str(user['_id'])
    return user

@app.route('/profile', methods=['GET'])
def get_profile():
    # Assuming you have authenticated the user and have their email available
    email = request.args.get('email')  # Get email from query parameter or session
    role=request.args.get('role')
    
    user = users_collection.find_one({'email': email})
    
    user = convert_objectid(user)
    # print(user)
    if user:
        return jsonify({'data':user})
    else:
        return jsonify({'error': 'User not found'})


# @app.route('/editprofile', methods=['POST'])
# def edprofile():
#     data = request.get_json()
#     print("Received Data:", data)  # Debugging: Check if data is received
#     email = data.get('email')
#     update_data = data.get('data')
    
#     if not email or not update_data:
#         return jsonify({'error': 'Invalid request, missing email or data'}), 400

#     update_data = {k: v for k, v in update_data.items() if v is not None}

#     user_data = users_collection.find_one({'email': email})

#     if not user_data:
#         return jsonify({'error': 'User not found'}), 404

#     # Ensure required fields exist
#     for key in ['education', 'companies', 'skills']:
#         if key not in user_data or not isinstance(user_data[key], list):
#             user_data[key] = []

#     for field, value in update_data.items():
#         if field == "photo":
#             user_data['photo'] = value
#         elif field == "education":
#             for edu in value:
#                 if edu['graduatedyear'] != '':
#                     if edu not in user_data['education']:
#                         user_data['education'].append(edu)
#         elif field == "companies":
#             for company in value:
#                 if company['name'] != '':
#                     if company not in user_data['companies']:
#                         user_data['companies'].append(company)
#         elif field == "skills":
#             if value:
#                 for skill in value:
#                     if skill.lower() not in map(str.lower, user_data['skills']):
#                         user_data['skills'].append(skill)
#         else:
#             user_data[field] = value if value != '' else user_data.get(field)

#     try:
#         result = users_collection.update_one({'email': email}, {'$set': user_data})
#         if result.modified_count == 0:
#             return jsonify({'error': 'No profile found to update'}), 400
#         return jsonify({'message': 'Profile updated successfully'}), 200
#     except Exception as e:
#         return jsonify({'error': f'An error occurred while updating the profile: {str(e)}'}), 500

import requests

@app.route('/editprofile', methods=['POST'])
def edprofile():
    data = request.get_json()
    print("Received Data:", data)  # Debugging: Check received data

    email = data.get('email')
    update_data = data.get('data')

    if not email or not update_data:
        return jsonify({'error': 'Invalid request, missing email or data'}), 400

    update_data = {k: v for k, v in update_data.items() if v is not None}

    user_data = users_collection.find_one({'email': email})

    if not user_data:
        return jsonify({'error': 'User not found'}), 404

    # Ensure required fields exist and follow the expected format
    default_structure = {
        "education": [],
        "companies": [],
        "skills": [],
        "location": {"lat": "", "lon": "", "address": ""}
    }

    for key, default_value in default_structure.items():
        if key not in user_data:
            user_data[key] = default_value

    for field, value in update_data.items():
        if field == "photo":
            user_data['photo'] = value
        elif field == "education":
            for edu in value:
                if edu.get('graduatedyear'):
                    try:
                        edu['graduatedyear'] = int(edu['graduatedyear'])  # Convert to int
                    except ValueError:
                        continue  # Skip if conversion fails
                    if edu not in user_data['education']:
                        user_data['education'].append(edu)
        elif field == "companies":
            for company in value:
                if company.get('name'):
                    if 'experience' in company:
                        try:
                            company['experience'] = int(company['experience'])  # Convert to int
                        except ValueError:
                            continue  # Skip if conversion fails
                    if company not in user_data['companies']:
                        user_data['companies'].append(company)
        elif field == "skills":
            if value:
                for skill in value:
                    if skill.lower() not in map(str.lower, user_data['skills']):
                        user_data['skills'].append(skill)
        elif field == "address":
            location_data = get_coordinates_osm(value)
            if "error" in location_data:
                location_data = {"latitude": "18.9057181", "longitude": "78.5832738"}  # Default location
            
            user_data['location'] = {
                "lat": f"{float(location_data['latitude']):.4f}",  # Round to 4 decimal places
                "lon": f"{float(location_data['longitude']):.4f}",
                "address": value
            }
        else:
            user_data[field] = value if value != '' else user_data.get(field)

    try:
        result = users_collection.update_one({'email': email}, {'$set': user_data})
        if result.modified_count == 0:
            return jsonify({'error': 'No profile found to update'}), 400
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while updating the profile: {str(e)}'}), 500


# Function to get coordinates from OpenStreetMap API
def get_coordinates_osm(address):
    if not address:
        return {"error": "Address is required"}
    
    url = f"https://nominatim.openstreetmap.org/search?q={address}&format=json&limit=1"
    response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    
    if response.status_code == 200 and response.json():
        location = response.json()[0]
        return {
            "latitude": f"{float(location['lat']):.4f}",  # Round lat to 4 decimal places
            "longitude": f"{float(location['lon']):.4f}"  # Round lon to 4 decimal places
        }
    else:
        return {"latitude": "18.9057181", "longitude": "78.5832738"}  # Default coordinates
  

import math
from pymongo import MongoClient
import time
import requests

def haversine_distance(lat1, lon1, lat2, lon2):
    # Radius of the Earth in kilometers (use 3958.8 for miles)
    R = 6371.0  

    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Differences in coordinates
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    # Distance in kilometers
    distance = R * c
    return distance

def calculate_priority(user1, user2):
    # Check if 'education' exists and has at least one entry for both users
    if 'education' in user1 and 'education' in user2:
        if len(user1['education']) > 0 and len(user2['education']) > 0:
            if user1['education'][0]['institution'] == user2['education'][0]['institution']:
                return 1  # Same current school

    # Check if 'companies' exists and has at least one entry for both users
    if 'companies' in user1 and 'companies' in user2:
        if len(user1['companies']) > 0 and len(user2['companies']) > 0:
            if user1['companies'][0]['name'] == user2['companies'][0]['name']:
                return 2  # Same current company

    # Check for matching past schools
    if 'education' in user1 and 'education' in user2:
        for edu1 in user1['education'][1:]:
            for edu2 in user2['education'][1:]:
                if edu1['institution'] == edu2['institution']:
                    return 3  # Same past school

    # Check for matching past companies
    if 'companies' in user1 and 'companies' in user2:
        for comp1 in user1['companies'][1:]:
            for comp2 in user2['companies'][1:]:
                if comp1['name'] == comp2['name']:
                    return 4  # Same past company

    return 5  # No match


def calculate_distances_for_all_users(main_user,users):
    
   
    v=0
   
    priority=[]
  

    distances=[]
    priority=[]
    # print(main_user['location'])
    origin=[float(main_user['location']['lat']),float(main_user['location']['lon'])]
   
    for user in users:
        if user["_id"] == main_user["_id"]:
            continue  # Skip comparing the user with themselves
        # distance = haversine_distance(float(main_user['location']['lat']), float(main_user['location']['lon']),
        #                               float(user['location']['lat']), float(user['location']['lon']))
        priority.append(calculate_priority(main_user, user))
        des=[float(user['location']['lat']),float(user['location']['lon'])]
        distances.append(haversine_distance(origin[0],origin[1],des[0],des[1]))        
        print(len(distances),len(priority))

       
    return distances,priority

def gmain(email):
      # Start time tracking
    # start_time = time.time()

    # MongoDB connection
    client = MongoClient('mongodb+srv://vinaysunkara:vinaysunkara@cluster0.snpbn.mongodb.net/?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true')
    db = client['RealTimeDataAnalysiss']
    collection = db['profiles_ind']
    
    # Fetch all users
    users = list(collection.find())
    # print(email)
    main_user = collection.find_one({'email': email})
    # print(main_user)
    # main_user={"_id":{"$oid":"672282bc1e5d932bd8e85d71"},"firstname":"Anika","lastname":"Gupta","education":[{"degree":"B.Tech Computer Science","institution":"Indian Institute of Technology Delhi","graduatedyear":{"$numberInt":"2018"}},{"degree":"M.Tech Computer Science","institution":"Indian Institute of Technology Bombay","graduatedyear":{"$numberInt":"2020"}},{"degree":"PhD Computer Science","institution":"Indian Institute of Science","graduatedyear":{"$numberInt":"2024"}}],"companies":[{"name":"Google India","position":"Software Engineer","experience":{"$numberInt":"3"}},{"name":"Amazon India","position":"Senior Software Engineer","experience":{"$numberInt":"2"}},{"name":"Microsoft India","position":"Software Development Manager","experience":{"$numberInt":"1"}}],"skills":["Java","Python","Cloud Computing","AWS","Azure","DevOps"],"location":{"lat":"28.6139","lon":"77.2090","address":"New Delhi"}}
    if not main_user:  # If user is not found, return an empty list or error
        print(f"No user found for email: {email}")
        return []
    valid_users = [user for user in users if "location" in user]
    distances,priority = calculate_distances_for_all_users(main_user,valid_users)

    print(len(distances),len(priority),len(users))

    sorted_users=[]
    for i in range(len(users)-1):

        sorted_users.append([priority[i],distances[i],i+1])

    sorted_users.sort()
    
    # print(sorted_users[:20])

    result=[]
    for i in range(len(sorted_users)):
        ind=sorted_users[i][2]
        result.append(users[ind])
    return result



from bson import ObjectId
# @app.route('/usersrec', methods=['POST'])
# def fun():
#     data = request.json  
#     email = data['params']['email']
#     result = gmain(email)  # Assuming `gmain(email)` returns a list of MongoDB documents
    
#     # Convert each document's ObjectId to a string
#     for doc in result[:10]:  # Limit to 10 results
#         if "_id" in doc:
#             doc["_id"] = str(doc["_id"])
    
#     return jsonify(result[:10])  # Return only the first 10 results

@app.route('/usersrec', methods=['POST'])
def fun():
    try:
        data = request.json
        print("Received Data:", data)  # Debugging
        
        if not data or 'params' not in data or 'email' not in data['params']:
            return jsonify({"error": "Invalid request format"}), 400
        
        email = data['params']['email']
        print("Email:", email)

        result = gmain(email)  # Ensure gmain(email) is not throwing an error
        print("Raw result:", result)

        if not isinstance(result, list):
            return jsonify({"error": "gmain did not return a list"}), 500

        # Convert ObjectId to string
        for doc in result[:10]:  
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
        
        print("Processed result:", result[:10])  # Debugging
        return jsonify(result[:10])  

    except Exception as e:
        print("Error:", str(e))  # Print full error to backend logs
        return jsonify({"error": str(e)}), 500

g_apikey = "AIzaSyA2vsEVR7to4-1aUzEcMuTlTXG5-UaJRII"
genai.configure(api_key=g_apikey)
model = genai.GenerativeModel('gemini-1.5-flash',
                              generation_config={"response_mime_type": "application/json"})

@app.route('/jobrec', methods=['POST'])
# def funnn():
#     data = request.json 
#     print(data)
#     email = data['params']['email']
#     user = users_collection.find_one({'email': email})
#     lst=[]
#     l = list(jobs.find())
#     l=l[:63]
#     st=0
#     cnt=63
#     while cnt<=len(l):
#         response = model.generate_content(str(l[st:cnt])+"""\n\n\nfor the above job description rate the below candidate out of 100 by considering skills, past experience and education of the candidate. If the eligibility criteria is not met by the candidate give rating as 0  in the given format:\n\n {{"_id":{"$oid":"6727856bfd969e51f45506de"},'rating':int},{..},..}, \n\n\n"""+ str(user))
#         score = json.loads(response.text)
#         k=st
#         for i in score:
#             sc=int(i['rating'])
#             lst.append([sc,k])
#             k+=1
#         st=cnt
#         if cnt+15<len(l):
#             cnt+=15
#         elif cnt<len(l):
#             cnt=len(l)
#         else:
#             break
#         print(cnt)
def funnn():
    data = request.json 
    print(data)
    email = data['params']['email']
    user = users_collection.find_one({'email': email})
    lst = []
    l = list(jobs.find())

    # Adjusting batch limit dynamically instead of hardcoding 63
    l = l[:min(len(l), 63)]
    
    st = 0
    cnt = min(15, len(l))  # Start with 15 and increase dynamically

    while st < len(l):
        response = model.generate_content(str(l[st:cnt]) + """
        
        Given the above job descriptions, evaluate the below candidate on a scale of 0 to 100 based on:
        - Skill match with job requirements
        - Past experience relevance
        - Educational qualification
        
        If the candidate does not meet the eligibility criteria, assign a score of 0.
        
        Provide output in **STRICT JSON format**:
        [
            {"_id": {"$oid": "6727856bfd969e51f45506de"}, "rating": <integer>},
            ...
        ]
        """ + str(user))

        try:
            score = json.loads(response.text)
            k = st
            for i in score:
                sc = int(i['rating'])
                lst.append([sc, k])
                k += 1
        except Exception as e:
            print(f"Error processing AI response: {e}")

        st = cnt
        if cnt + 15 < len(l):
            cnt += 15
        elif cnt < len(l):
            cnt = len(l)
        else:
            break
        print(cnt)
        
        
        
    print(lst)
    lst.sort(reverse=True)
    ans = []
    for i in lst:
        ans.append(l[i[1]])
    for doc in ans:
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
    # print(ans)
    # return jsonify(ans)
    return jsonify(ans[:6])  # Returns only the first 6 jobs

def scrape_microsoft_jobs(skills):  
    try:
        driver.get('https://jobs.careers.microsoft.com/global/en/search')
        path_prefix = 'https://jobs.careers.microsoft.com/global/en/job/'

        # Wait for page to load completely
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Search by job title, ID, or keyword']"))
        )

        search_box = driver.find_element(By.XPATH, "//input[@placeholder='Search by job title, ID, or keyword']")
        input_box = driver.find_element(By.XPATH, "//input[@placeholder='City, state, or country/region']")
        
        # Clear existing text before entering new text
        search_box.clear()
        search_box.send_keys(skills)
        input_box.clear()
        input_box.send_keys("India")
        
        # Wait for button to be clickable before clicking
        button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Find jobs']"))
        )
        button.click()
        
        # Increased wait time for results to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[aria-label^='Job item']"))
        )
        
        # Add a short pause to ensure dynamic content is fully loaded
        time.sleep(2)

        jobs_list = []
        jobs = driver.find_elements(By.CSS_SELECTOR, "[aria-label^='Job item']")
        
        for job in jobs:
            try:
                job_id = job.get_attribute('aria-label').replace("Job item ", "").strip()
                title = job.find_element(By.TAG_NAME, "h2").text.strip()
                job_url = f"{path_prefix}{job_id}/{title.replace(' ', '-')}"
                # jobs_list.append(f'<a href="{job_url}" target="_blank">{title}</a>')
                jobs_list.append({"title": title, "url": job_url})
            except Exception as e:
                print(f"Error processing Microsoft job: {e}")
        
        return jobs_list
    except Exception as e:
        print(f"Error in Microsoft job scraping: {e}")
        return []  # Return empty list in case of error

def scrape_oracle_jobs(skills):
    try:
        driver.get('https://careers.oracle.com/jobs/#en/sites/jobsearch/')

        # Wait for page to load completely
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@aria-label='Find jobs and events']"))
        )

        search_box = driver.find_element(By.XPATH, "//input[@aria-label='Find jobs and events']")
        location_box = driver.find_element(By.XPATH, "//input[@placeholder='City, state, country']")
        
        # Clear existing text before entering new text
        search_box.clear()
        search_box.send_keys(skills)
        location_box.clear()
        location_box.send_keys("India")
        
        # Wait for button to be clickable before clicking
        search_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@title='Search for Jobs and Events']"))
        )
        search_button.click()

        # Increased wait time for results to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "li[data-qa='searchResultItem']"))
        )
        
        # Add a short pause to ensure dynamic content is fully loaded
        time.sleep(2)

        jobs_list = []
        jobs = driver.find_elements(By.CSS_SELECTOR, "li[data-qa='searchResultItem']")
        
        for job in jobs:
            try:
                title = job.find_element(By.XPATH, ".//span[contains(@class, 'job-tile__title')]").text
                job_url = job.find_element(By.TAG_NAME, "a").get_attribute("href")
                jobs_list.append({"title": title, "url": job_url})
                # jobs_list.append(f'<a href="{job_url}" target="_blank">{title}</a>')
            except Exception as e:
                print(f"Error processing Oracle job: {e}")
        
        return jobs_list
    except Exception as e:
        print(f"Error in Oracle job scraping: {e}")
        return []  # Return empty list in case of error

@app.route('/get-jobs', methods=['POST'])
def get_jobs():
    # Configure Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = None

    try:
        # Initialize WebDriver (Selenium Manager will handle ChromeDriver)
        driver = webdriver.Chrome(options=chrome_options)

        # Extract request data
        data = request.get_json()
        email = data.get('email')
        company = data.get("company", "").lower()

        if not email:
            return jsonify({"error": "Missing email parameter"}), 400

        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({"error": "No user found with the given email"}), 400
        
        skills = ", ".join(user.get("skills", [])[:2])

        if not company or not skills:
            return jsonify({"error": "Missing company or skills parameter"}), 400

        # Scrape job listings based on company name
        if company == "microsoft":
            jobs = scrape_microsoft_jobs(skills)
        elif company == "oracle":
            jobs = scrape_oracle_jobs(skills)
        else:
            return jsonify({"error": "Invalid company name"}), 400

        return jsonify({"jobs": jobs})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Always close the driver when done
        if driver:
            driver.quit()

@app.route('/recruiters', methods=['GET'])
def get_recruiters():
    recruiters = list(recruiter_check_collection.find())
    for recruiter in recruiters:
        recruiter['_id'] = str(recruiter['_id'])  # Convert ObjectId to string
    return jsonify(recruiters)

# Endpoint to delete a recruiter
@app.route('/recruiters/<id>', methods=['DELETE'])
def delete_recruiter(id):
    recruiter_check_collection.delete_one({"_id": ObjectId(id)})
    return jsonify({"msg": "Recruiter deleted"}), 200

# Endpoint to accept a recruiter and add to mail collection
@app.route('/recruiters/<id>/accept', methods=['POST'])
def accept_recruiter(id):
    recruiter = recruiter_check_collection.find_one({"_id": ObjectId(id)})
    if recruiter:
        recruiter_collection.insert_one(recruiter)  # Insert into mail_collection
        recruiter_check_collection.delete_one({"_id": ObjectId(id)})  # Remove from recruiters collection
        return jsonify({"msg": "Recruiter accepted"}), 200
    return jsonify({"msg": "Recruiter not found"}), 404




companies_collection = db['companies']

@app.route('/jobform', methods=['POST'])
def post_job():
    try:
        data = request.json
        companies_collection.insert_one(data)
        return jsonify({"message": "Job posted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/applyjob', methods=['POST'])
def apply_job():
    try:
        data = request.get_json()  # Extract JSON payload
        print("Received Data:", data)  # Debugging log

        email = data.get("email")
        company = data.get("company")
        role = data.get("role")

        if not email or not company or not role:
            return jsonify({"message": "Missing email, company, or role"}), 400

        # Check if the user already applied for this job
        existing_application = appliedjobs_collection.find_one({
            "email": email,
            "company": company,
            "role": role
        })

        if existing_application:
            return jsonify({"message": "You have already applied for this job!"}), 409

        # Insert new job application
        new_application = {
            "email": email,
            "company": company,
            "role": role,
            
        }
        appliedjobs_collection.insert_one(new_application)

        return jsonify({"message": "Successfully applied for the job!"}), 201

    except Exception as e:
        print("Error processing request:", str(e))
        return jsonify({"message": "Server error"}), 500


@app.route('/appliedjobs/<email>', methods=['GET'])
def get_applied_jobs(email):
    try:
        print("Email received:", email)  # Debugging print

        if not email:
            return jsonify({"message": "Missing email"}), 400

        # Fetch all jobs applied by the user and remove _id field
        applied_jobs = list(appliedjobs_collection.find({"email": email}, {"_id": 0}))

        return jsonify(applied_jobs), 200

    except Exception as e:
        print("Error fetching applied jobs:", str(e))
        return jsonify({"message": "Server error"}), 500

    
if __name__ == '__main__':
    socketio.run(app, port=5005,debug=True)