export interface PortfolioData {
    navbar_data: NavbarData;
    hero_data: HeroData;
    about_data: AboutData;
    career_title_data: CareerTitleData;
    career_data: CareerData[];
    skills_data: SkillsData;
    contact_data: ContactData;
    footer_data: FooterData;
}

export interface NavbarData {
    link_title: string;
    about_name: string;
    career_name: string;
    skills_name: string;
    contact_name: string;
}

export interface HeroData {
    hero_img_url: string;
}

export interface AboutData {
    about_name: string;
    about_icon_url: string;
    about_img_url: string;
    sns_list: SNSItem[];
    about_contents: string[];
}

export interface SNSItem {
    sns_name: string;
    sns_url: string;
    sns_img: string;
}

export interface CareerTitleData {
    career_title_period: string;
    career_title_member: string;
    career_title_contents: string;
    career_title_stack: string;
    career_title_phase: string;
    career_title_role: string;
}

export interface CareerData {
    career_title: string;
    career_start: string;
    career_end: string;
    career_member: string;
    career_contents: string;
    career_skill_stack: string[];
    career_skill_phase: string[];
    career_role: string;
}

export interface SkillsData {
    skills_cards: SkillCard[];
    skills_more: string;
}

export interface SkillCard {
    skills_card_icon: string;
    skills_card_name: string;
    skills_card_contents: string;
}

export interface ContactData {
    contact_name: string;
    contact_email: string;
    contact_contents: string;
    contact_btn_name: string;
}

export interface FooterData {
    copyright: string;
}

// Contact form types
export interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

export interface ContactFormErrors {
    name?: string;
    email?: string;
    message?: string;
}
