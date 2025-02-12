create table projects (
id UUID primary key default gen_random_uuid(),
type VARCHAR(50) not null check (type in ('PUBLICATION', 'PATENT', 'RESEARCH')),
title VARCHAR(256) not null,
description text not null
)

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
