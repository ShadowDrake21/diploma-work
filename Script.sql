create table projects (
id UUID primary key default gen_random_uuid(),
type VARCHAR(50) not null check (type in ('PUBLICATION', 'PATENT', 'RESEARCH')),
title VARCHAR(256) not null,
description text not null
)

alter table projects 
add column created_at timestamp default current_timestamp,
add column updated_at timestamp default current_timestamp;

create table publications (
id UUID primary key default gen_random_uuid(),
project_id uuid not null,
publication_date date not null,
publication_source varchar(255) not null,
doi_isbn varchar(100) not null,
start_page int not null,
end_page int not null,
journal_volume int not null,
issue_numbers int not null,
foreign key (project_id) references projects(id) on delete cascade
)

create table publications_authors (
publication_id UUID references publications(id) on delete cascade,
user_id bigint references users(id) on delete cascade,
primary key(publication_id, user_id)
)

create table patents (
id UUID primary key default gen_random_uuid(),
project_id uuid not null,
primary_author bigint not null,
registration_number varchar(100),
registration_date date,
issuing_authority varchar(255),
foreign key (project_id) references projects(id) on delete cascade,
foreign key (primary_author) references users(id) on delete cascade
)

create table patents_co_inventors (
patent_id uuid references patents(id) on delete cascade,
user_id bigint references users(id) on delete cascade,
primary key (patent_id, user_id)
)


create table research_projects (
id uuid primary key default gen_random_uuid(),
project_id uuid not null,
budget decimal(15,2) not null check (budget >= 0),
start_date date not null,
end_date date not null,
status varchar(50) not null,
funding_source varchar(255) not null,
foreign key (project_id) references projects(id) on delete cascade
)

create table research_projects_participants (
research_project_id uuid references research_projects(id) on delete cascade,
user_id bigint references users(id) on delete cascade,
primary key (research_project_id, user_id)
)

create table tags (
id uuid primary key default gen_random_uuid(),
name varchar(100) unique not null
)

create table project_tags(
project_id uuid references projects(id) on delete cascade,
tag_id uuid references tags(id) on delete cascade,
primary key (project_id, tag_id)
)


ALTER TABLE IF EXISTS patents 
    ALTER COLUMN registration_date 
    SET DATA TYPE DATE 
    USING registration_date::date;


ALTER TABLE IF EXISTS publications
    ALTER column publication_date 
    SET DATA TYPE DATE 
    USING publication_date::date;

ALTER TABLE publications_authors DROP constraint publications_authors_pkey;
ALTER TABLE publications_authors ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE publications_authors ADD CONSTRAINT unique_publication_user UNIQUE (publication_id, user_id);

ALTER TABLE research_projects_participants DROP CONSTRAINT research_projects_participants_pkey;
ALTER TABLE research_projects_participants ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE research_projects_participants ADD CONSTRAINT unique_project_user UNIQUE (research_project_id, user_id);

ALTER TABLE project_tags DROP CONSTRAINT project_tags_pkey;
ALTER TABLE project_tags ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE project_tags ADD CONSTRAINT unique_project_tag UNIQUE (project_id, tag_id);

ALTER TABLE patents_co_inventors DROP CONSTRAINT patents_co_inventors_pkey;
ALTER TABLE patents_co_inventors ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE patents_co_inventors ADD CONSTRAINT unique_patent_user UNIQUE (patent_id, user_id);

alter table projects add column progress smallint default 0 check (progress between 0 and 100)


-- General Tags
INSERT INTO tags (name) VALUES
('AI (Artificial Intelligence)'),
('Machine Learning'),
('Data Science'),
('Big Data'),
('Cloud Computing'),
('Cybersecurity'),
('Blockchain'),
('IoT (Internet of Things)'),
('Sustainability'),
('Innovation'),
('Research'),
('Development'),
('Prototype'),
('MVP (Minimum Viable Product)'),
('Open Source'),
('Collaboration'),
('Startup'),
('Enterprise'),
('Agile'),
('DevOps')
ON CONFLICT (name) DO NOTHING;

-- Domain-Specific Tags
-- Technology
INSERT INTO tags (name) VALUES
('Web Development'),
('Mobile Development'),
('Frontend'),
('Backend'),
('Full Stack'),
('UI/UX Design'),
('AR/VR (Augmented Reality/Virtual Reality)'),
('Robotics'),
('Automation'),
('Quantum Computing'),
('5G'),
('Edge Computing')
ON CONFLICT (name) DO NOTHING;

-- Healthcare
INSERT INTO tags (name) VALUES
('Biotechnology'),
('Genomics'),
('Telemedicine'),
('Medical Devices'),
('Pharmaceuticals'),
('Health Informatics'),
('Wearable Technology'),
('Clinical Trials'),
('Precision Medicine')
ON CONFLICT (name) DO NOTHING;

-- Environmental Science
INSERT INTO tags (name) VALUES
('Renewable Energy'),
('Climate Change'),
('Carbon Footprint'),
('Water Conservation'),
('Waste Management'),
('Biodiversity'),
('Eco-Friendly'),
('Green Technology'),
('Sustainable Agriculture')
ON CONFLICT (name) DO NOTHING;

-- Business & Finance
INSERT INTO tags (name) VALUES
('Fintech'),
('Cryptocurrency'),
('Digital Transformation'),
('E-commerce'),
('Supply Chain'),
('Logistics'),
('Marketing'),
('Sales'),
('Customer Experience'),
('Risk Management')
ON CONFLICT (name) DO NOTHING;

-- Education
INSERT INTO tags (name) VALUES
('E-Learning'),
('EdTech'),
('Gamification'),
('Curriculum Development'),
('STEM (Science, Technology, Engineering, Mathematics)'),
('Online Education'),
('Lifelong Learning')
ON CONFLICT (name) DO NOTHING;

-- Social Sciences
INSERT INTO tags (name) VALUES
('Sociology'),
('Psychology'),
('Anthropology'),
('Political Science'),
('Public Policy'),
('Urban Planning'),
('Community Development')
ON CONFLICT (name) DO NOTHING;

-- Creative & Arts
INSERT INTO tags (name) VALUES
('Graphic Design'),
('Animation'),
('Game Development'),
('Music Production'),
('Film Production'),
('Creative Writing'),
('Photography'),
('Digital Art')
ON CONFLICT (name) DO NOTHING;

-- Project Stage Tags
INSERT INTO tags (name) VALUES
('Ideation'),
('Planning'),
('Design'),
('Development'),
('Testing'),
('Deployment'),
('Maintenance'),
('Completed'),
('On Hold'),
('Archived')
ON CONFLICT (name) DO NOTHING;

-- Geographical Tags
INSERT INTO tags (name) VALUES
('Global'),
('North America'),
('Europe'),
('Asia'),
('Africa'),
('South America'),
('Australia'),
('Local'),
('Urban'),
('Rural')
ON CONFLICT (name) DO NOTHING;

-- Technology Stack Tags
INSERT INTO tags (name) VALUES
('JavaScript'),
('Python'),
('Java'),
('React'),
('Angular'),
('Node.js'),
('Django'),
('Flask'),
('TensorFlow'),
('PyTorch'),
('Kubernetes'),
('Docker'),
('AWS'),
('Azure'),
('Google Cloud')
ON CONFLICT (name) DO NOTHING;

-- Example Tags for Your Project
INSERT INTO tags (name) VALUES
('Angular'),
('Material Design'),
('Form Handling'),
('Stepper UI'),
('Reactive Forms'),
('Project Management'),
('Data Binding'),
('API Integration'),
('Frontend Development'),
('User Interface')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE diploma.users 
ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;

-- Create the comments table
CREATE TABLE diploma.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign key to users table
    user_id BIGINT NOT NULL REFERENCES diploma.users(id) ON DELETE CASCADE,
    
    -- Foreign key to projects table
    
    
    project_id UUID NOT NULL REFERENCES diploma.projects(id) ON DELETE CASCADE,
    
    -- Self-referential foreign key for replies
    parent_comment_id UUID REFERENCES diploma.comments(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES diploma.users(id),
    CONSTRAINT fk_comment_project FOREIGN KEY (project_id) REFERENCES diploma.projects(id),
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES diploma.comments(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_comments_project ON diploma.comments(project_id);
CREATE INDEX idx_comments_parent ON diploma.comments(parent_comment_id);
CREATE INDEX idx_comments_user ON diploma.comments(user_id);
CREATE INDEX idx_comments_created ON diploma.comments(created_at);

-- Add trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_timestamp
BEFORE UPDATE ON diploma.comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_timestamp();

-- Optional: Add comments for documentation
COMMENT ON TABLE diploma.comments IS 'Stores user comments on projects with support for threaded replies';
COMMENT ON COLUMN diploma.comments.parent_comment_id IS 'Reference to parent comment for nested replies (NULL for top-level comments)';
COMMENT ON COLUMN diploma.comments.likes IS 'Count of likes/loves/reactions to the comment';

ALTER TABLE diploma.users 
ADD COLUMN date_of_birth DATE NULL,
ADD COLUMN user_type VARCHAR(20) NULL,
ADD COLUMN university_group VARCHAR(50) NULL,
ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('student', 'teacher', 'researcher', NULL));

ALTER TABLE diploma.users 
ADD COLUMN phone_number VARCHAR(20) NULL;

CREATE TABLE diploma.user_projects (
    user_id bigint NOT NULL,
    project_id uuid NOT NULL,
    CONSTRAINT user_projects_pkey PRIMARY KEY (user_id, project_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES diнploma.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES diploma.projects(id) ON DELETE CASCADE
);

INSERT INTO diploma.user_projects (user_id, project_id) 
VALUES (16, '2afa76f4-0e6c-4a02-aa74-fc642de1812f');

SELECT * FROM user_projects;

SELECT * FROM users WHERE id IN (15, 16); 

ALTER TABLE projects 
ADD COLUMN created_by BIGINT REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE diploma.users 
ADD COLUMN publication_count INT DEFAULT 0,
ADD COLUMN patent_count INT DEFAULT 0,
ADD COLUMN research_count INT DEFAULT 0;

CREATE OR REPLACE FUNCTION diploma.update_user_project_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle DELETE operation
    IF (TG_OP = 'DELETE') THEN
        UPDATE diploma.users
        SET 
            publication_count = (
                SELECT COUNT(*) 
                FROM diploma.projects 
                WHERE created_by = OLD.created_by 
                AND type = 'PUBLICATION'
            ),
            patent_count = (
                SELECT COUNT(*) 
                FROM diploma.projects 
                WHERE created_by = OLD.created_by 
                AND type = 'PATENT'
            ),
            research_count = (
                SELECT COUNT(*) 
                FROM diploma.projects 
                WHERE created_by = OLD.created_by 
                AND type = 'RESEARCH'
            )
        WHERE id = OLD.created_by;
    -- Handle INSERT or UPDATE operations
    ELSE
        UPDATE diploma.users
        SET 
            publication_count = (
                SELECT COUNT(*) 
                FROM diploma.projects 
                WHERE created_by = NEW.created_by 
                AND type = 'PUBLICATION'
            ),
            patent_count = (
                SELECT COUNT(*) 
                FROM diploma.projects 
                WHERE created_by = NEW.created_by 
                AND type = 'PATENT'
            ),
            research_count = (
                SELECT COUNT(*) 
                FROM diploma.projects 
                WHERE created_by = NEW.created_by 
                AND type = 'RESEARCH'
            )
        WHERE id = NEW.created_by;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for INSERT/UPDATE/DELETE on projects
CREATE TRIGGER update_project_counts
AFTER INSERT OR UPDATE OF created_by, type OR DELETE ON diploma.projects
FOR EACH ROW EXECUTE FUNCTION diploma.update_user_project_counts();

ALTER TABLE diploma.users
ADD COLUMN affiliation VARCHAR(255) NULL;

UPDATE diploma.users 
SET affiliation = 'Національний університет «Чернігівська Політехніка»' 
WHERE affiliation IS NULL;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_project_counts ON diploma.projects;

-- Modify the column type (if still needed)
ALTER TABLE diploma.projects ALTER COLUMN type SET DATA TYPE varchar(50);

-- Recreate the trigger with your actual function
CREATE TRIGGER update_project_counts
AFTER INSERT OR UPDATE OF created_by, type OR DELETE ON diploma.projects
FOR EACH ROW 
EXECUTE FUNCTION diploma.update_user_project_counts();

ALTER TABLE diploma.publications_authors ADD COLUMN version INTEGER DEFAULT 0;





ALTER TABLE diploma.files 
ADD COLUMN file_size bigint,
ADD COLUMN checksum varchar(32);


CREATE TABLE diploma.comment_likes (
    comment_id UUID NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id, user_id),
    CONSTRAINT fk_comment_likes_comment FOREIGN KEY (comment_id) REFERENCES diploma.comments(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_likes_user FOREIGN KEY (user_id) REFERENCES diploma.users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_comment_likes_comment ON diploma.comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON diploma.comment_likes(user_id);


ALTER table diploma.users ADD COLUMN updated_at TIMESTAMP;

CREATE TABLE diploma.project_audit_log (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    original_owner_id BIGINT NOT NULL,
    original_owner_name VARCHAR(255),
    action_by_admin_id BIGINT NOT NULL,
    action_by_admin_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    action_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    additional_info TEXT
);

-- Add index for better query performance on frequently searched columns
CREATE INDEX idx_project_audit_log_project_id ON diploma.project_audit_log(project_id);
CREATE INDEX idx_project_audit_log_action_timestamp ON diploma.project_audit_log(action_timestamp);
CREATE INDEX idx_project_audit_log_action_by_admin_id ON diploma.project_audit_log(action_by_admin_id);


ALTER TABLE diploma.projects DROP CONSTRAINT projects_created_by_fkey;
ALTER TABLE diploma.projects 
ALTER COLUMN created_by DROP NOT NULL,
ADD COLUMN deleted_user_id BIGINT;
ALTER TABLE diploma.projects 
ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) 
REFERENCES diploma.users(id) ON DELETE SET NULL;

CREATE TABLE active_tokens (
    token VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_active_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_active_tokens_user_id ON active_tokens(user_id);
CREATE INDEX idx_active_tokens_expiry ON active_tokens(expiry);

ALTER TABLE diploma.users 
ADD COLUMN active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN deleted_at TIMESTAMP;

ALTER TABLE diploma.users 
DROP CONSTRAINT users_role_check,
ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN'));

ALTER TABLE diploma.users 
ALTER COLUMN affiliation SET DEFAULT 'Національний університет «Чернігівська Політехніка»';

CREATE INDEX idx_users_active ON diploma.users(active);
CREATE INDEX idx_users_role ON diploma.users(role);
