import type { Schema, Struct } from '@strapi/strapi';

export interface AboutSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_about_social_links';
  info: {
    description: 'A dynamic social media link with customizable icon';
    displayName: 'Social Link';
    icon: 'link';
  };
  attributes: {
    icon: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_about_team_members';
  info: {
    description: 'A team member with photo, name, role, and social links';
    displayName: 'Team Member';
    icon: 'user';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    photo: Schema.Attribute.Media<'images'>;
    role: Schema.Attribute.String;
    socialLinks: Schema.Attribute.Component<'about.social-link', true>;
  };
}

export interface EpaperPage extends Struct.ComponentSchema {
  collectionName: 'components_epaper_pages';
  info: {
    description: '';
    displayName: 'Page';
    icon: 'file-alt';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface FaqFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_faq_faq_items';
  info: {
    description: 'Individual FAQ question and answer';
    displayName: 'FAQ Item';
    icon: 'question-circle';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationBaseLink extends Struct.ComponentSchema {
  collectionName: 'components_navigation_base_links';
  info: {
    description: '';
    displayName: 'Base Link';
    icon: 'link';
  };
  attributes: {
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationDropdownHeader extends Struct.ComponentSchema {
  collectionName: 'components_navigation_dropdown_headers';
  info: {
    description: '';
    displayName: 'Dropdown Header';
    icon: 'heading';
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationDropdownMenu extends Struct.ComponentSchema {
  collectionName: 'components_navigation_dropdown_menus';
  info: {
    description: '';
    displayName: 'Dropdown Menu';
    icon: 'arrow-down';
  };
  attributes: {
    subMenus: Schema.Attribute.DynamicZone<
      [
        'navigation.base-link',
        'navigation.dropdown-header',
        'navigation.nested-dropdown',
      ]
    >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationHeaderLink extends Struct.ComponentSchema {
  collectionName: 'components_navigation_header_links';
  info: {
    description: 'A header navigation link with label and URL';
    displayName: 'Header Link';
    icon: 'link';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationMegaMenu extends Struct.ComponentSchema {
  collectionName: 'components_navigation_mega_menus';
  info: {
    description: '';
    displayName: 'Mega Menu';
    icon: 'layer-group';
  };
  attributes: {
    sections: Schema.Attribute.Component<'navigation.mega-menu-section', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationMegaMenuLink extends Struct.ComponentSchema {
  collectionName: 'components_navigation_mega_menu_links';
  info: {
    description: '';
    displayName: 'Mega Menu Link';
    icon: 'link';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationMegaMenuSection extends Struct.ComponentSchema {
  collectionName: 'components_navigation_mega_menu_sections';
  info: {
    description: '';
    displayName: 'Mega Menu Section';
    icon: 'grid';
  };
  attributes: {
    heading: Schema.Attribute.String;
    links: Schema.Attribute.Component<'navigation.mega-menu-link', true>;
  };
}

export interface NavigationMenuButton extends Struct.ComponentSchema {
  collectionName: 'components_navigation_menu_buttons';
  info: {
    description: '';
    displayName: 'Menu Button';
    icon: 'cursor';
  };
  attributes: {
    buttonType: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'outline']
    > &
      Schema.Attribute.DefaultTo<'primary'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationNestedDropdown extends Struct.ComponentSchema {
  collectionName: 'components_navigation_nested_dropdowns';
  info: {
    description: '';
    displayName: 'Nested Dropdown';
    icon: 'arrow-right';
  };
  attributes: {
    subMenus: Schema.Attribute.Component<'navigation.base-link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_navigation_social_links';
  info: {
    description: 'A social media link with icon class and URL';
    displayName: 'Social Link';
    icon: 'link';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationVideoMenu extends Struct.ComponentSchema {
  collectionName: 'components_navigation_video_menus';
  info: {
    description: 'A mega menu displaying up to 5 video items';
    displayName: 'Video Menu';
    icon: 'video';
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
    videos: Schema.Attribute.Component<'navigation.video-menu-item', true>;
  };
}

export interface NavigationVideoMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_navigation_video_menu_items';
  info: {
    description: 'An individual video item for the Video Mega Menu';
    displayName: 'Video Menu Item';
    icon: 'play';
  };
  attributes: {
    thumbnail: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PollOption extends Struct.ComponentSchema {
  collectionName: 'components_poll_options';
  info: {
    description: 'Option for poll voting';
    displayName: 'Poll Option';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
    voteCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    description: 'Dynamic social link (Title + URL)';
    displayName: 'Social Link';
    icon: 'link';
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'about.social-link': AboutSocialLink;
      'about.team-member': AboutTeamMember;
      'epaper.page': EpaperPage;
      'faq.faq-item': FaqFaqItem;
      'navigation.base-link': NavigationBaseLink;
      'navigation.dropdown-header': NavigationDropdownHeader;
      'navigation.dropdown-menu': NavigationDropdownMenu;
      'navigation.header-link': NavigationHeaderLink;
      'navigation.mega-menu': NavigationMegaMenu;
      'navigation.mega-menu-link': NavigationMegaMenuLink;
      'navigation.mega-menu-section': NavigationMegaMenuSection;
      'navigation.menu-button': NavigationMenuButton;
      'navigation.nested-dropdown': NavigationNestedDropdown;
      'navigation.social-link': NavigationSocialLink;
      'navigation.video-menu': NavigationVideoMenu;
      'navigation.video-menu-item': NavigationVideoMenuItem;
      'poll.option': PollOption;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.social-link': SharedSocialLink;
    }
  }
}
