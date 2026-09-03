export const SKILL_ALIASES: Record<string, string> = {
  // Web Basics
  "html": "HTML", "html5": "HTML",
  "css": "CSS", "css3": "CSS",
  "sass": "Sass", "scss": "Sass", "less": "LESS",
  
  // JavaScript & TypeScript
  "js": "JavaScript", "javascript": "JavaScript",
  "ts": "TypeScript", "typescript": "TypeScript",
  "node": "Node.js", "nodejs": "Node.js", "node.js": "Node.js",
  "express": "Express", "expressjs": "Express", "express.js": "Express",
  "nestjs": "NestJS", "nest.js": "NestJS", "nest": "NestJS",

  // Frontend Frameworks
  "reactjs": "React", "react.js": "React", "react js": "React", "react": "React",
  "nextjs": "Next.js", "next.js": "Next.js",
  "angular": "Angular", "angularjs": "Angular", "angular.js": "Angular",
  "vue": "Vue", "vuejs": "Vue", "vue.js": "Vue",
  "svelte": "Svelte", "sveltekit": "Svelte",
  "tailwind": "Tailwind CSS", "tailwindcss": "Tailwind CSS",
  "bootstrap": "Bootstrap", "material-ui": "Material-UI", "mui": "Material-UI",
  "redux": "Redux", "mobx": "MobX", "zustand": "Zustand",
  
  // Backend & Languages
  "python": "Python", "django": "Django", "flask": "Flask", "fastapi": "FastAPI",
  "java": "Java", "spring": "Spring", "spring boot": "Spring Boot",
  "c#": "C#", "csharp": "C#", "asp.net": ".NET", "dotnet": ".NET",
  "c++": "C++", "cpp": "C++", "c": "C",
  "golang": "Go", "go": "Go",
  "php": "PHP", "laravel": "Laravel", "symfony": "Symfony",
  "ruby": "Ruby", "ruby on rails": "Ruby on Rails", "rails": "Ruby on Rails",
  "rust": "Rust", "kotlin": "Kotlin", "swift": "Swift", "dart": "Dart", "scala": "Scala",
  
  // Databases & ORM
  "postgres": "PostgreSQL", "postgresql": "PostgreSQL",
  "mongo": "MongoDB", "mongodb": "MongoDB", "mongoose": "MongoDB",
  "mysql": "MySQL", "mariadb": "MariaDB",
  "sqlite": "SQLite", "oracle": "Oracle DB", "sql server": "SQL Server", "mssql": "SQL Server",
  "redis": "Redis", "elasticsearch": "Elasticsearch", "cassandra": "Cassandra",
  "prisma": "Prisma", "typeorm": "TypeORM", "sequelize": "Sequelize",
  "sql": "SQL", "nosql": "NoSQL",

  // Cloud & DevOps
  "aws": "AWS", "amazon web services": "AWS", "ec2": "AWS", "s3": "AWS",
  "gcp": "Google Cloud", "google cloud": "Google Cloud", "google cloud platform": "Google Cloud",
  "azure": "Azure", "microsoft azure": "Azure",
  "k8s": "Kubernetes", "kubernetes": "Kubernetes",
  "docker": "Docker", "docker compose": "Docker",
  "jenkins": "Jenkins", "github actions": "GitHub Actions", "gitlab ci": "GitLab CI", "ci/cd": "CI/CD",
  "terraform": "Terraform", "ansible": "Ansible", "linux": "Linux", "unix": "Unix",
  "devops": "DevOps", "nginx": "Nginx", "apache": "Apache",

  // Mobile
  "flutter": "Flutter", "react native": "React Native", "android": "Android", "ios": "iOS",
  
  // AI, Data & ML
  "machine learning": "Machine Learning", "ml": "Machine Learning", "deep learning": "Deep Learning",
  "data science": "Data Science", "data analytics": "Data Analytics",
  "artificial intelligence": "AI", "ai": "AI",
  "numpy": "NumPy", "pandas": "Pandas", "tensorflow": "TensorFlow", "pytorch": "PyTorch", "scikit-learn": "Scikit-Learn",
  "power bi": "Power BI", "tableau": "Tableau", "excel": "Excel",

  // Design & UX
  "figma": "Figma", "figjam": "FigJam", "ui/ux": "UI/UX", "ui": "UI Design", "ux": "UX Design",
  "ui design": "UI Design", "ux design": "UX Design", "adobe xd": "Adobe XD", "photoshop": "Photoshop",
  "illustrator": "Illustrator", "canva": "Canva", "wireframing": "Wireframing", "wireframes": "Wireframing",
  "prototyping": "Prototyping", "prototypes": "Prototyping", "user research": "User Research",
  "ux research": "UX Research", "usability testing": "Usability Testing", "design systems": "Design Systems",
  "design system": "Design Systems", "interaction design": "Interaction Design", "visual design": "Visual Design",
  "user flows": "User Flows", "user flow": "User Flows", "information architecture": "Information Architecture",
  "typography": "Typography", "product design": "Product Design", "user personas": "User Personas",
  
  // General & Tools
  "cybersecurity": "Cybersecurity", "security": "Security",
  "git": "Git", "github": "GitHub", "gitlab": "GitLab", "bitbucket": "Bitbucket",
  "rest api": "REST API", "rest": "REST API", "restful": "REST API",
  "graphql": "GraphQL", "apollo": "GraphQL",
  "agile": "Agile", "scrum": "Scrum", "jira": "Jira",
  "jest": "Jest", "cypress": "Cypress", "mocha": "Mocha", "selenium": "Selenium"
};

export const ROLE_RULES = [
  {
    role: "UI/UX Designer",
    requiredSkills: ["Figma", "UI/UX", "UI Design", "UX Design", "Wireframing", "Prototyping", "User Research", "Design Systems", "Adobe XD", "Interaction Design", "Visual Design"],
    minMatches: 2
  },
  {
    role: "Product Designer",
    requiredSkills: ["Product Design", "Figma", "UI/UX", "Design Systems", "Prototyping", "User Research", "Interaction Design"],
    minMatches: 2
  },
  {
    role: "Graphic Designer",
    requiredSkills: ["Photoshop", "Illustrator", "Canva", "Typography", "Visual Design"],
    minMatches: 2
  },
  {
    role: "Frontend Developer",
    requiredSkills: ["React", "Vue", "Angular", "HTML", "CSS", "JavaScript", "TypeScript"],
    minMatches: 2
  },
  {
    role: "Backend Developer",
    requiredSkills: ["Node.js", "Python", "Java", "C#", "Go", "PostgreSQL", "MongoDB", "Spring Boot", "Django"],
    minMatches: 2
  },
  {
    role: "Full Stack Developer",
    requiredSkills: ["React", "Vue", "Angular", "Node.js", "Python", "Java", "PostgreSQL"],
    minMatches: 3 // Needs front and back conceptually, but simplified here
  },
  {
    role: "Data Scientist / Analyst",
    requiredSkills: ["Python", "Machine Learning", "Data Science", "Tableau", "Power BI", "Excel"],
    minMatches: 2
  },
  {
    role: "DevOps / Cloud Engineer",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Linux", "DevOps"],
    minMatches: 2
  }
];

export const ALL_STANDARD_SKILLS = Array.from(new Set(Object.values(SKILL_ALIASES)));
