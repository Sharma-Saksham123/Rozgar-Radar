-- Rozgar Radar — 20 mock jobs (no scraping, all data fictional)
-- Run after supabase/schema.sql. Safe to re-run: fixed ids + on conflict.

insert into public.jobs
  (id, title, company, description, location, min_degree, allowed_branches,
   grad_year_min, grad_year_max, min_percentage, skills, apply_url)
values
('a0000000-0000-4000-8000-000000000001',
 'Software Development Engineer (SDE) I', 'Infosys',
 $$We are hiring freshers for our digital services division. Candidates must be B.Tech graduates in Computer Science, IT or ECE graduating in 2025 or 2026 with a minimum of 60 percent aggregate. You will work on Java backend services and must be comfortable with data structures and algorithms, SQL and OOP. Strong problem solving and communication skills are required.$$
 , 'Bangalore, India', 'B.Tech', '{CSE,IT,ECE}', 2025, 2026, 60,
 '{Java,Data Structures,SQL,OOP}', 'https://example.com/apply/infosys-sde-1'),

('a0000000-0000-4000-8000-000000000002',
 'Graduate Trainee Engineer', 'TCS',
 $$Our Graduate Trainee Engineer programme targets 2025 and 2026 graduates holding a B.Tech or B.E degree in Computer Science, Information Technology or Electronics. The selection requires 55 percent aggregate or above. Training covers Java, Python and basic cloud fundamentals. No prior experience is needed, we teach on the job.$$
 , 'Hyderabad, India', 'B.Tech', '{CSE,IT,ECE}', 2025, 2026, 55,
 '{Java,Python,Cloud Basics}', 'https://example.com/apply/tcs-gte'),

('a0000000-0000-4000-8000-000000000003',
 'Full Stack Developer (Fresher)', 'Zoho',
 $$Freshers with a B.Tech or B.E in Computer Science or IT graduating in 2025 or 2026 can apply. The candidate should have a minimum of 60 percent marks and hands on exposure to React, Node.js and REST APIs. We value candidates who have built personal projects using TypeScript.$$
 , 'Chennai, India', 'B.Tech', '{CSE,IT}', 2025, 2026, 60,
 '{React,Node.js,TypeScript,REST}', 'https://example.com/apply/zoho-fullstack'),

('a0000000-0000-4000-8000-000000000004',
 'Data Analyst Intern', 'Razorpay',
 $$We are looking for B.Sc, B.Com or BBA graduates in Statistics, Mathematics, Economics or Commerce graduating in 2025 or 2026 with 60 percent aggregate. The intern will work on SQL, Python and Excel dashboards. Prior internship experience in analytics is a plus but not mandatory.$$
 , 'Bangalore, India', 'B.Sc', '{Statistics,Mathematics,Economics,Commerce}', 2025, 2026, 60,
 '{SQL,Python,Excel,Tableau}', 'https://example.com/apply/razorpay-data'),

('a0000000-0000-4000-8000-000000000005',
 'Junior Data Engineer', 'Zomato',
 $$The role needs a B.Tech or B.E degree in Computer Science or IT from the 2025 or 2026 batch with 60 percent or above. You will build ingestion pipelines using Python and Spark and write SQL transformations. We welcome candidates from tier 2 and tier 3 campuses.$$
 , 'Gurugram, India', 'B.Tech', '{CSE,IT}', 2025, 2026, 60,
 '{Python,Spark,SQL,Airflow}', 'https://example.com/apply/zomato-data-eng'),

('a0000000-0000-4000-8000-000000000006',
 'Business Analyst', 'Swiggy',
 $$BBA, B.Com or B.Sc graduates graduating in 2025 or 2026 with at least 55 percent aggregate are eligible. Any branch is acceptable for this role. The analyst will map delivery metrics, run SQL queries and present insights to stakeholders. Strong Excel and communication skills are essential.$$
 , 'Bangalore, India', 'BBA', '{Any}', 2025, 2026, 55,
 '{SQL,Excel,Data Analysis,Communication}', 'https://example.com/apply/swiggy-ba'),

('a0000000-0000-4000-8000-000000000007',
 'iOS Developer (Junior)', 'Flipkart',
 $$We need B.Tech or B.E graduates in Computer Science or IT from the 2025 or 2026 batch with 60 percent aggregate. Candidates should know Swift, UIKit and have built at least one iOS app. Git and code review familiarity is expected.$$
 , 'Bengaluru, India', 'B.Tech', '{CSE,IT}', 2025, 2026, 60,
 '{Swift,iOS,UIKit,Git}', 'https://example.com/apply/flipkart-ios'),

('a0000000-0000-4000-8000-000000000008',
 'Android Developer', 'Paytm',
 $$Freshers with a B.Tech or B.E in CSE, IT or ECE graduating in 2025 or 2026 and scoring 60 percent above can apply. The role involves Kotlin, Android SDK and MVVM architecture. Exposure to Jetpack Compose is a strong plus.$$
 , 'Noida, India', 'B.Tech', '{CSE,IT,ECE}', 2025, 2026, 60,
 '{Kotlin,Android,MVVM,Jetpack}', 'https://example.com/apply/paytm-android'),

('a0000000-0000-4000-8000-000000000009',
 'DevOps Engineer (Entry Level)', 'Adobe',
 $$This entry level role requires a B.Tech in Computer Science or IT graduating in 2025 or 2026 with a minimum of 65 percent aggregate. You will work with Linux, Docker, Kubernetes and CI CD pipelines. Scripting in Bash or Python is required.$$
 , 'Noida, India', 'B.Tech', '{CSE,IT}', 2025, 2026, 65,
 '{Linux,Docker,Kubernetes,CI/CD,Bash}', 'https://example.com/apply/adobe-devops'),

('a0000000-0000-4000-8000-000000000010',
 'QA / Test Engineer', 'Wipro',
 $$Diploma, B.Tech or B.E candidates in Computer Science, IT or ECE from the 2025 or 2026 batch with 50 percent aggregate are welcome. You will write manual test cases and automate with Selenium. Attention to detail matters more than heavy coding.$$
 , 'Pune, India', 'Diploma', '{CSE,IT,ECE}', 2025, 2026, 50,
 '{Selenium,Manual Testing,API Testing}', 'https://example.com/apply/wipro-qa'),

('a0000000-0000-4000-8000-000000000011',
 'Support Engineer', 'Amazon',
 $$We hire B.Tech or B.E graduates in ECE, Mechanical, Computer Science or IT graduating in 2025 or 2026 with 55 percent and above. The role involves troubleshooting, networking basics and customer communication. Rotational shifts apply.$$
 , 'Hyderabad, India', 'B.Tech', '{ECE,Mechanical,CSE,IT}', 2025, 2026, 55,
 '{Networking,Troubleshooting,Communication}', 'https://example.com/apply/amazon-support'),

('a0000000-0000-4000-8000-000000000012',
 'Web Developer', 'Mphasis',
 $$Candidates holding a B.Tech or Diploma in Computer Science or IT graduating in 2025 or 2026 with 50 percent aggregate can apply. You will build responsive UI with HTML, CSS and JavaScript and consume REST APIs. Knowledge of Bootstrap is helpful.$$
 , 'Bangalore, India', 'Diploma', '{CSE,IT}', 2025, 2026, 50,
 '{HTML,CSS,JavaScript,Bootstrap,REST}', 'https://example.com/apply/mphasis-web'),

('a0000000-0000-4000-8000-000000000013',
 'Cloud Support Associate', 'Accenture',
 $$This role is open to B.Tech graduates in CSE, IT or ECE from the 2025 or 2026 batch with 55 percent aggregate or higher. You will support AWS based infrastructure, monitor incidents and write documentation. Linux fundamentals are expected.$$
 , 'Chennai, India', 'B.Tech', '{CSE,IT,ECE}', 2025, 2026, 55,
 '{AWS,Linux,Networking,Incident Response}', 'https://example.com/apply/accenture-cloud'),

('a0000000-0000-4000-8000-000000000014',
 'Machine Learning Engineer (Fresher)', 'Fractal Analytics',
 $$We need B.Tech or M.Tech graduates in CSE, ECE or AI ML from the 2025 or 2026 batch with a high academic record of 70 percent and above. Strong Python, statistics and model building skills are required. A masters degree is preferred for research heavy teams.$$
 , 'Bangalore, India', 'B.Tech', '{CSE,ECE,AI-ML}', 2025, 2026, 70,
 '{Python,Machine Learning,Statistics,PyTorch}', 'https://example.com/apply/fractal-mle'),

('a0000000-0000-4000-8000-000000000015',
 'Cybersecurity Analyst', 'Deloitte',
 $$Candidates must hold a B.Tech in Computer Science or IT graduating in 2025 or 2026 with 60 percent aggregate. The work involves network monitoring, threat analysis and ethical hacking fundamentals. CEH certification is a plus.$$
 , 'Hyderabad, India', 'B.Tech', '{CSE,IT}', 2025, 2026, 60,
 '{Networking,Ethical Hacking,Security,Linux}', 'https://example.com/apply/deloitte-security'),

('a0000000-0000-4000-8000-000000000016',
 'Digital Marketing Executive', 'Groww',
 $$BBA, B.Com or any graduate degree from the 2025 or 2026 batch with 50 percent aggregate can apply. Any branch is acceptable. You will run SEO, paid campaigns and analytics reporting. Content writing skills are required.$$
 , 'Mumbai, India', 'BBA', '{Any}', 2025, 2026, 50,
 '{SEO,Google Analytics,Content,Campaigns}', 'https://example.com/apply/groww-marketing'),

('a0000000-0000-4000-8000-000000000017',
 'Financial Analyst', 'Zerodha',
 $$This position is open to B.Com, B.Sc or BBA graduates in Commerce, Finance or Economics graduating in 2025 or 2026 with 60 percent aggregate. You will build financial models, use Excel and run SQL for reporting. CA or CFA is not required.$$
 , 'Mumbai, India', 'B.Com', '{Commerce,Finance,Economics}', 2025, 2026, 60,
 '{Excel,SQL,Financial Modeling,Reporting}', 'https://example.com/apply/zerodha-fa'),

('a0000000-0000-4000-8000-000000000018',
 'Content Writer', 'Ola',
 $$Any graduate degree from the 2025 or 2026 batch with 45 percent aggregate is acceptable, branch does not matter. Freshers are encouraged to apply. The role covers app copy, blogs and SEO friendly content. Strong English writing is the key skill.$$
 , 'Bengaluru, India', 'Other', '{Any}', 2025, 2026, 45,
 '{Content Writing,SEO,English,Copywriting}', 'https://example.com/apply/ola-content'),

('a0000000-0000-4000-8000-000000000019',
 'Frontend Developer Intern', 'Freshworks',
 $$Internship open to B.Tech or B.E students in Computer Science or IT who will graduate in 2026 or 2027 with 55 percent aggregate. You will ship features in React and TypeScript with a mentor. Stipend is provided for the full duration.$$
 , 'Chennai, India', 'B.Tech', '{CSE,IT}', 2026, 2027, 55,
 '{React,TypeScript,CSS,Git}', 'https://example.com/apply/freshworks-fe'),

('a0000000-0000-4000-8000-000000000020',
 'Site Reliability Trainee', 'BrowserStack',
 $$The trainee programme welcomes B.Tech graduates in CSE or IT from the 2025 or 2026 batch with 60 percent and above. You will monitor infrastructure, automate with Docker and learn reliability practices on the job. On call training is provided.$$
 , 'Mumbai, India', 'B.Tech', '{CSE,IT}', 2025, 2026, 60,
 '{Linux,Docker,Monitoring,Prometheus}', 'https://example.com/apply/browserstack-sre')
on conflict (id) do update set
  title = excluded.title,
  company = excluded.company,
  description = excluded.description,
  location = excluded.location,
  min_degree = excluded.min_degree,
  allowed_branches = excluded.allowed_branches,
  grad_year_min = excluded.grad_year_min,
  grad_year_max = excluded.grad_year_max,
  min_percentage = excluded.min_percentage,
  skills = excluded.skills,
  apply_url = excluded.apply_url;
