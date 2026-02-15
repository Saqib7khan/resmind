/**
 * PDF Generator - Creates professional resume PDFs from structured data
 */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from '@react-pdf/renderer';

// Register fonts (using standard fonts for now)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
    { src: 'Helvetica-Oblique', fontStyle: 'italic' },
  ],
});

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 3,
  },
  contactLink: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 3,
  },
  summary: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  experienceItem: {
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  jobDate: {
    fontSize: 9,
    color: '#64748b',
  },
  companyInfo: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 5,
  },
  bulletList: {
    marginLeft: 15,
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletPoint: {
    width: 8,
    fontSize: 10,
    color: '#2563eb',
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: '#475569',
    lineHeight: 1.4,
  },
  educationItem: {
    marginBottom: 10,
  },
  degreeTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  institutionInfo: {
    fontSize: 9.5,
    color: '#475569',
    marginTop: 2,
  },
  skillsContainer: {
    marginBottom: 8,
  },
  skillCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 3,
  },
  skillsList: {
    fontSize: 9.5,
    color: '#475569',
    marginBottom: 5,
    lineHeight: 1.3,
  },
  certificationItem: {
    marginBottom: 6,
  },
  certName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  certInfo: {
    fontSize: 9,
    color: '#64748b',
  },
  projectItem: {
    marginBottom: 10,
  },
  projectName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  projectDesc: {
    fontSize: 9.5,
    color: '#475569',
    marginBottom: 3,
    lineHeight: 1.3,
  },
  projectTech: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
  },
});

interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    bullets: string[];
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills?: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

interface ResumePDFProps {
  data: ResumeData;
}

export const ResumePDFDocument: React.FC<ResumePDFProps> = ({ data }) => {
  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.personal.name}</Text>
          <Text style={styles.contactInfo}>
            {data.personal.email} • {data.personal.phone}
            {data.personal.location && ` • ${data.personal.location}`}
          </Text>
          {(data.personal.linkedin || data.personal.website) && (
            <Text style={styles.contactInfo}>
              {data.personal.linkedin && (
                <Link src={data.personal.linkedin} style={styles.contactLink}>
                  LinkedIn
                </Link>
              )}
              {data.personal.linkedin && data.personal.website && ' • '}
              {data.personal.website && (
                <Link src={data.personal.website} style={styles.contactLink}>
                  Portfolio
                </Link>
              )}
            </Text>
          )}
        </View>

        {/* Professional Summary */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</Text>
            {data.experience.map((exp, idx) => (
              <View key={idx} style={styles.experienceItem}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{exp.position}</Text>
                  <Text style={styles.jobDate}>
                    {formatDate(exp.startDate)} -{' '}
                    {exp.current ? 'Present' : formatDate(exp.endDate || '')}
                  </Text>
                </View>
                <Text style={styles.companyInfo}>
                  {exp.company}
                  {exp.location && ` • ${exp.location}`}
                </Text>
                <View style={styles.bulletList}>
                  {exp.bullets.map((bullet, bidx) => (
                    <View key={bidx} style={styles.bullet}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {data.education.map((edu, idx) => (
              <View key={idx} style={styles.educationItem}>
                <Text style={styles.degreeTitle}>
                  {edu.degree} in {edu.field}
                </Text>
                <Text style={styles.institutionInfo}>
                  {edu.institution} • {formatDate(edu.graduationDate)}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            {data.skills.technical && data.skills.technical.length > 0 && (
              <View style={styles.skillsContainer}>
                <Text style={styles.skillCategory}>Technical Skills:</Text>
                <Text style={styles.skillsList}>
                  {data.skills.technical.join(' • ')}
                </Text>
              </View>
            )}
            {data.skills.soft && data.skills.soft.length > 0 && (
              <View style={styles.skillsContainer}>
                <Text style={styles.skillCategory}>Soft Skills:</Text>
                <Text style={styles.skillsList}>
                  {data.skills.soft.join(' • ')}
                </Text>
              </View>
            )}
            {data.skills.languages && data.skills.languages.length > 0 && (
              <View style={styles.skillsContainer}>
                <Text style={styles.skillCategory}>Languages:</Text>
                <Text style={styles.skillsList}>
                  {data.skills.languages.join(' • ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
            {data.certifications.map((cert, idx) => (
              <View key={idx} style={styles.certificationItem}>
                <Text style={styles.certName}>{cert.name}</Text>
                <Text style={styles.certInfo}>
                  {cert.issuer} • {formatDate(cert.date)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
            {data.projects.map((project, idx) => (
              <View key={idx} style={styles.projectItem}>
                <Text style={styles.projectName}>
                  {project.name}
                  {project.link && (
                    <>
                      {' • '}
                      <Link src={project.link} style={styles.contactLink}>
                        View Project
                      </Link>
                    </>
                  )}
                </Text>
                <Text style={styles.projectDesc}>{project.description}</Text>
                <Text style={styles.projectTech}>
                  Technologies: {project.technologies.join(', ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
