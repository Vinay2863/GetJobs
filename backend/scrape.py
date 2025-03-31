import time  
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service  

path = "C:/Users/preet/MajorProject/Project_Major/public/chromedriver.exe"
service = Service(path)
driver = webdriver.Chrome(service=service)

def microsoft(skills):  
    driver.get('https://jobs.careers.microsoft.com/global/en/search')
    path_prefix = 'https://jobs.careers.microsoft.com/global/en/job/'

    time.sleep(3)  

    search_box = driver.find_element(By.XPATH, "//input[@placeholder='Search by job title, ID, or keyword']")
    input_box = driver.find_element(By.XPATH, "//input[@placeholder='City, state, or country/region']")
    button = driver.find_element(By.XPATH, "//button[@aria-label='Find jobs']")
    
    search_box.send_keys(skills)
    input_box.send_keys("India")
    time.sleep(3)  
    button.click()
    time.sleep(5)  

    jobs_list = []
    jobs = driver.find_elements(By.CSS_SELECTOR, "[aria-label^='Job item']")
    
    for job in jobs:
        try:
            job_id = job.get_attribute('aria-label').replace("Job item ", "").strip()
            title = job.find_element(By.TAG_NAME, "h2").text.strip()
            job_url = f"{path_prefix}{job_id}/{title.replace(' ', '-')}"
            jobs_list.append(f'<a href="{job_url}" target="_blank">{title}</a>')
        
        except Exception as e:
            print(f"Error processing job: {e}")
    driver.quit()

    return jobs_list

# # Get job listings
# jobs_listings = microsoft("Python Developer")

# # Save as an HTML file
# html_content = "<html><body><h2>Microsoft Jobs</h2><ul>" + "".join(f"<li>{job}</li>" for job in jobs_listings) + "</ul></body></html>"

# with open("microsoft_jobs.html", "w", encoding="utf-8") as file:
#     file.write(html_content)

# print("Job listings saved in 'microsoft_jobs.html'")
def oracle(skills):
    driver.get('https://careers.oracle.com/jobs/#en/sites/jobsearch/')
    
    # Wait for the search box to load
    time.sleep(15)

    # Find search elements
    search_box = driver.find_element(By.XPATH, "//input[@aria-label='Find jobs and events']")
    location_box = driver.find_element(By.XPATH, "//input[@placeholder='City, state, country']")
    search_button = driver.find_element(By.XPATH, "//button[@title='Search for Jobs and Events']")
    
    # Input job title and location
    search_box.send_keys(skills)
    location_box.send_keys("India")
    
    time.sleep(3)  
    search_button.click()
    time.sleep(10)

    jobs_list = []
    jobs = driver.find_elements(By.CSS_SELECTOR, "li[data-qa='searchResultItem']")
    for job in jobs:
        try:
            title = job.find_element(By.XPATH, ".//span[contains(@class, 'job-tile__title')]").text
            job_url = job.get_attribute("href")
            jobs_list.append(f'<a href="{job_url}" target="_blank">{title}</a>')
        except Exception as e:
            print(f"Error processing job: {e}")
    driver.quit()

    return jobs_list

# # Get job listings
# jobs_listings = oracle("Python Developer")

# # Save as an HTML file
# html_content = "<html><body><h2>Microsoft Jobs</h2><ul>" + "".join(f"<li>{job}</li>" for job in jobs_listings) + "</ul></body></html>"

# with open("microsoft_jobs.html", "w", encoding="utf-8") as file:
#     file.write(html_content)

# print("Job listings saved in 'microsoft_jobs.html'")