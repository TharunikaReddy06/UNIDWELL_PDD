export interface College {
  id: string;
  name: string;
  university?: string;
  city: string;
  state: string;
  shortName?: string;
}

export const indianColleges: College[] = [
  // SIMATS
  { id: 'simats-1', name: 'SIMATS School of Engineering', university: 'Saveetha Institute of Medical and Technical Sciences', city: 'Chennai', state: 'Tamil Nadu', shortName: 'SIMATS' },
  { id: 'simats-2', name: 'SIMATS Institute of Technology', university: 'Saveetha Institute of Medical and Technical Sciences', city: 'Chennai', state: 'Tamil Nadu', shortName: 'SIMATS' },
  { id: 'simats-3', name: 'Saveetha Medical College & Hospital (SIMATS)', university: 'Saveetha Institute of Medical and Technical Sciences', city: 'Chennai', state: 'Tamil Nadu', shortName: 'SIMATS' },
  { id: 'simats-4', name: 'Saveetha Dental College & Hospital (SIMATS)', university: 'Saveetha Institute of Medical and Technical Sciences', city: 'Chennai', state: 'Tamil Nadu', shortName: 'SIMATS' },
  { id: 'simats-5', name: 'Saveetha School of Law (SIMATS)', university: 'Saveetha Institute of Medical and Technical Sciences', city: 'Chennai', state: 'Tamil Nadu', shortName: 'SIMATS' },

  // VIT
  { id: 'vit-1', name: 'VIT Vellore', university: 'Vellore Institute of Technology', city: 'Vellore', state: 'Tamil Nadu', shortName: 'VIT' },
  { id: 'vit-2', name: 'VIT Chennai', university: 'Vellore Institute of Technology', city: 'Chennai', state: 'Tamil Nadu', shortName: 'VIT' },
  { id: 'vit-3', name: 'VIT AP', university: 'Vellore Institute of Technology', city: 'Amaravati', state: 'Andhra Pradesh', shortName: 'VIT' },
  { id: 'vit-4', name: 'VIT Bhopal', university: 'Vellore Institute of Technology', city: 'Bhopal', state: 'Madhya Pradesh', shortName: 'VIT' },

  // SRM
  { id: 'srm-1', name: 'SRM Institute of Science and Technology (Kattankulathur)', university: 'SRM University', city: 'Chennai', state: 'Tamil Nadu', shortName: 'SRM' },
  { id: 'srm-2', name: 'SRM Institute of Science and Technology (Ramapuram)', university: 'SRM University', city: 'Chennai', state: 'Tamil Nadu', shortName: 'SRM' },
  { id: 'srm-3', name: 'SRM Institute of Science and Technology (Vadapalani)', university: 'SRM University', city: 'Chennai', state: 'Tamil Nadu', shortName: 'SRM' },
  { id: 'srm-4', name: 'SRM University AP', university: 'SRM University', city: 'Amaravati', state: 'Andhra Pradesh', shortName: 'SRM' },
  { id: 'srm-5', name: 'SRM University NCR', university: 'SRM University', city: 'Ghaziabad', state: 'Uttar Pradesh', shortName: 'SRM' },

  // IITs
  { id: 'iit-1', name: 'IIT Madras', university: 'Indian Institute of Technology Madras', city: 'Chennai', state: 'Tamil Nadu', shortName: 'IITM' },
  { id: 'iit-2', name: 'IIT Bombay', university: 'Indian Institute of Technology Bombay', city: 'Mumbai', state: 'Maharashtra', shortName: 'IITB' },
  { id: 'iit-3', name: 'IIT Delhi', university: 'Indian Institute of Technology Delhi', city: 'New Delhi', state: 'Delhi', shortName: 'IITD' },
  { id: 'iit-4', name: 'IIT Kanpur', university: 'Indian Institute of Technology Kanpur', city: 'Kanpur', state: 'Uttar Pradesh', shortName: 'IITK' },
  { id: 'iit-5', name: 'IIT Hyderabad', university: 'Indian Institute of Technology Hyderabad', city: 'Hyderabad', state: 'Telangana', shortName: 'IITH' },
  { id: 'iit-6', name: 'IIT Kharagpur', university: 'Indian Institute of Technology Kharagpur', city: 'Kharagpur', state: 'West Bengal', shortName: 'IITKGP' },
  { id: 'iit-7', name: 'IIT Roorkee', university: 'Indian Institute of Technology Roorkee', city: 'Roorkee', state: 'Uttarakhand', shortName: 'IITR' },
  { id: 'iit-8', name: 'IIT Guwahati', university: 'Indian Institute of Technology Guwahati', city: 'Guwahati', state: 'Assam', shortName: 'IITG' },
  { id: 'iit-9', name: 'IIT BHU Varanasi', university: 'Indian Institute of Technology (BHU) Varanasi', city: 'Varanasi', state: 'Uttar Pradesh', shortName: 'IITBHU' },

  // NITs
  { id: 'nit-1', name: 'NIT Trichy', university: 'National Institute of Technology Tiruchirappalli', city: 'Tiruchirappalli', state: 'Tamil Nadu', shortName: 'NITT' },
  { id: 'nit-2', name: 'NIT Warangal', university: 'National Institute of Technology Warangal', city: 'Warangal', state: 'Telangana', shortName: 'NITW' },
  { id: 'nit-3', name: 'NIT Surathkal', university: 'National Institute of Technology Karnataka', city: 'Mangalore', state: 'Karnataka', shortName: 'NITK' },
  { id: 'nit-4', name: 'NIT Calicut', university: 'National Institute of Technology Calicut', city: 'Kozhikode', state: 'Kerala', shortName: 'NITC' },
  { id: 'nit-5', name: 'NIT Rourkela', university: 'National Institute of Technology Rourkela', city: 'Rourkela', state: 'Odisha', shortName: 'NITR' },
  { id: 'nit-6', name: 'NIT Kurukshetra', university: 'National Institute of Technology Kurukshetra', city: 'Kurukshetra', state: 'Haryana', shortName: 'NITKKR' },

  // KL University
  { id: 'klu-1', name: 'KL University (Guntur)', university: 'Koneru Lakshmaiah Education Foundation', city: 'Guntur', state: 'Andhra Pradesh', shortName: 'KLU' },
  { id: 'klu-2', name: 'KL University (Hyderabad)', university: 'Koneru Lakshmaiah Education Foundation', city: 'Hyderabad', state: 'Telangana', shortName: 'KLU' },

  // JNTU
  { id: 'jntu-1', name: 'JNTU Kakinada', university: 'Jawaharlal Nehru Technological University Kakinada', city: 'Kakinada', state: 'Andhra Pradesh', shortName: 'JNTUK' },
  { id: 'jntu-2', name: 'JNTU Hyderabad', university: 'Jawaharlal Nehru Technological University Hyderabad', city: 'Hyderabad', state: 'Telangana', shortName: 'JNTUH' },
  { id: 'jntu-3', name: 'JNTU Anantapur', university: 'Jawaharlal Nehru Technological University Anantapur', city: 'Anantapur', state: 'Andhra Pradesh', shortName: 'JNTUA' },

  // Anna University & Major TN Colleges
  { id: 'anna-1', name: 'Anna University (CEG Campus)', university: 'Anna University', city: 'Chennai', state: 'Tamil Nadu', shortName: 'AU' },
  { id: 'anna-2', name: 'MIT Campus, Anna University', university: 'Anna University', city: 'Chennai', state: 'Tamil Nadu', shortName: 'MIT' },
  { id: 'psg-1', name: 'PSG College of Technology', university: 'Anna University', city: 'Coimbatore', state: 'Tamil Nadu', shortName: 'PSG Tech' },
  { id: 'loyola-1', name: 'Loyola College', university: 'University of Madras', city: 'Chennai', state: 'Tamil Nadu', shortName: 'Loyola' },
  { id: 'ssn-1', name: 'SSN College of Engineering', university: 'Anna University', city: 'Chennai', state: 'Tamil Nadu', shortName: 'SSN' },
  { id: 'sastra-1', name: 'SASTRA Deemed University', university: 'SASTRA University', city: 'Thanjavur', state: 'Tamil Nadu', shortName: 'SASTRA' },

  // Osmania & Telangana/AP Colleges
  { id: 'osmania-1', name: 'Osmania University', university: 'Osmania University', city: 'Hyderabad', state: 'Telangana', shortName: 'OU' },
  { id: 'au-1', name: 'Andhra University', university: 'Andhra University', city: 'Visakhapatnam', state: 'Andhra Pradesh', shortName: 'AU' },
  { id: 'cbit-1', name: 'Chaitanya Bharathi Institute of Technology (CBIT)', university: 'Osmania University', city: 'Hyderabad', state: 'Telangana', shortName: 'CBIT' },
  { id: 'vnr-1', name: 'VNR Vignana Jyothi Institute of Engineering and Technology', university: 'JNTUH', city: 'Hyderabad', state: 'Telangana', shortName: 'VNRVJIET' },

  // BITS Pilani
  { id: 'bits-1', name: 'BITS Pilani (Pilani Campus)', university: 'Birla Institute of Technology and Science', city: 'Pilani', state: 'Rajasthan', shortName: 'BITS' },
  { id: 'bits-2', name: 'BITS Pilani (Goa Campus)', university: 'Birla Institute of Technology and Science', city: 'Goa', state: 'Goa', shortName: 'BITS' },
  { id: 'bits-3', name: 'BITS Pilani (Hyderabad Campus)', university: 'Birla Institute of Technology and Science', city: 'Hyderabad', state: 'Telangana', shortName: 'BITS' },

  // Karnataka & Kerala
  { id: 'rvce-1', name: 'RV College of Engineering', university: 'Visvesvaraya Technological University', city: 'Bengaluru', state: 'Karnataka', shortName: 'RVCE' },
  { id: 'bms-1', name: 'BMS College of Engineering', university: 'Visvesvaraya Technological University', city: 'Bengaluru', state: 'Karnataka', shortName: 'BMSCE' },
  { id: 'manipal-1', name: 'Manipal Institute of Technology', university: 'MAHE', city: 'Manipal', state: 'Karnataka', shortName: 'MIT Manipal' },
  { id: 'cet-1', name: 'College of Engineering Trivandrum', university: 'APJ Abdul Kalam Technological University', city: 'Thiruvananthapuram', state: 'Kerala', shortName: 'CET' },

  // Delhi & North India
  { id: 'nsut-1', name: 'Netaji Subhas University of Technology (NSUT)', university: 'NSUT', city: 'New Delhi', state: 'Delhi', shortName: 'NSUT' },
  { id: 'dtu-1', name: 'Delhi Technological University (DTU)', university: 'DTU', city: 'New Delhi', state: 'Delhi', shortName: 'DTU' },
  { id: 'ststephens-1', name: "St. Stephen's College", university: 'University of Delhi', city: 'New Delhi', state: 'Delhi', shortName: 'DU' },
  { id: 'amity-1', name: 'Amity University Noida', university: 'Amity University', city: 'Noida', state: 'Uttar Pradesh', shortName: 'Amity' }
];

/**
 * Filter colleges based on search query matching name, university, city, state, or shortName.
 */
export function filterColleges(query: string): College[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return indianColleges;

  return indianColleges.filter((c) => {
    const nameMatch = c.name.toLowerCase().includes(cleanQuery);
    const uniMatch = c.university?.toLowerCase().includes(cleanQuery);
    const cityMatch = c.city.toLowerCase().includes(cleanQuery);
    const stateMatch = c.state.toLowerCase().includes(cleanQuery);
    const shortMatch = c.shortName?.toLowerCase().includes(cleanQuery);

    return nameMatch || uniMatch || cityMatch || stateMatch || shortMatch;
  });
}
