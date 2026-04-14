const mongoose = require("mongoose");

const siteContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      enum: ["home", "about", "contact", "settings"],
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

// Default content for each section
const defaultContent = {
  home: {
    heroTitle: "Your Trusted Pharma Wholesale Partner",
    heroSubtitle:
      "Biolex Pharmaceutical Private Limited — supplying quality medicines to wholesalers and healthcare professionals across India.",
    heroBadge: "ISO 9001:2015 | WHO-GMP Supported Manufacturing",
    heroCta1: "Browse Products",
    heroCta2: "Get Quote",
    statsYears: "5+",
    statsProducts: "500+",
    statsPartners: "100+",
    statsSupport: "24/7",
    testimonialTitle: "What Our Partners Say",
    testimonialSubtitle:
      "Trusted by healthcare professionals and distributors across India",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle:
      "Get answers to common questions about our pharmaceutical wholesale services",
    ctaTitle: "Ready to Partner With Us?",
    ctaSubtitle:
      "Send us an inquiry for product details, pricing, and availability. Our team responds within 24 hours.",
    whyUsTitle: "Why Choose Biolex?",
    whyUsSubtitle:
      "We go beyond just supplying medicines — we build lasting partnerships",
    bannerImages: [],
  },
  about: {
    heroTitle: "About Biolex Pharmaceutical",
    heroSubtitle:
      "Established on 2 September 2020 — your trusted PCD pharma franchise and wholesale partner from Chandigarh",
    overviewTitle: "Who We Are",
    overviewPara1:
      "Biolex Pharmaceutical Private Limited is an active Indian pharma company established on 2 September 2020. Based in Chandigarh, we operate as a wholesaler, distributor, and PCD pharma franchise company with ISO 9001:2015 certification and WHO-GMP supported manufacturing.",
    overviewPara2:
      "We deal in a comprehensive range of pharmaceutical products including Tablets, Capsules, Syrups, Injections, and Protein Powders. Our business model encompasses PCD Pharma Franchise, Third-Party Manufacturing, and Wholesale & Distribution.",
    overviewPara3:
      "With our strong commitment to quality and customer satisfaction, we have built lasting relationships with wholesalers, distributors, and healthcare professionals across India. Our GSTIN (04AAJCB2451N1ZM) and CIN (U51909CH2020PTC043192) reflect our fully compliant corporate identity.",
    missionTitle: "Our Mission",
    missionText:
      "To provide quality pharmaceutical products at competitive prices while maintaining the highest standards of service and reliability. We aim to be the preferred wholesale and PCD franchise partner for healthcare professionals and businesses across India.",
    visionTitle: "Our Vision",
    visionText:
      "To become a leading pharmaceutical wholesale distributor and PCD franchise company in India, recognized for our commitment to quality, customer satisfaction, and ethical business practices.",
    ceoName: "Ravi Kumar Bhalla",
    location:
      "SCF-320, 2nd Floor, Motor Market, Manimajra, Chandigarh – 160101",
    businessType: "Wholesaler / Distributor / PCD Pharma Franchise",
    established: "2 September 2020",
    employees: "Up to 10",
    certification: "ISO 9001:2015 | WHO-GMP Supported",
    gstNo: "04AAJCB2451N1ZM",
    cinNo: "U51909CH2020PTC043192",
    dealIn: "Tablets, Capsules, Syrups, Injections, Protein Powders",
    businessModel:
      "PCD Pharma Franchise, Third-Party Manufacturing, Wholesale & Distribution",
  },
  contact: {
    heroTitle: "Contact Us",
    heroSubtitle:
      "Get in touch with us for product inquiries, PCD franchise, and partnerships",
    address: "SCF-320, 2nd Floor, Motor Market, Manimajra, Chandigarh – 160101",
    phone: "8816036666, 8629936666",
    email: "biolexpharmaceuticals@gmail.com",
    businessHours: "Monday - Saturday: 9:00 AM - 6:00 PM",
    mapUrl:
      "https://maps.google.com?q=SCF-320+Motor+Market+Manimajra+Chandigarh",
    formTitle: "Send Us a Message",
    infoTitle: "Contact Information",
    infoSubtitle:
      "Feel free to reach out to us through any of the following channels.",
    gstin: "04AAJCB2451N1ZM",
    cin: "U51909CH2020PTC043192",
  },
  settings: {
    whatsappNumber: "",
  },
};

siteContentSchema.statics.getContent = async function (section) {
  let doc = await this.findOne({ section });
  if (!doc) {
    doc = await this.create({ section, content: defaultContent[section] });
  }
  return doc.content;
};

siteContentSchema.statics.defaultContent = defaultContent;

module.exports = mongoose.model("SiteContent", siteContentSchema);
