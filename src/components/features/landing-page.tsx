'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Zap,
  Target,
  CheckCircle2,
  ArrowRight,
  Brain,
  Eye,
} from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { Marquee } from '@/components/ui/marquee';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const skills = [
  'ATS Optimization',
  'AI-Powered',
  'Professional Formatting',
  'Smart Analysis',
  'Instant PDF',
  'Gap Detection',
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-3xl animate-pulse" />

        <div className="relative container mx-auto px-4 py-20">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-20"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ResMind 2.0
              </span>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <button className="px-6 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-all">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          </motion.header>

          {/* Hero Content */}
          <div className="text-center mb-16">
            <motion.h1
              {...fadeInUp}
              className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
            >
              Don&apos;t Just Get Feedback
              <br />
              <span className="text-purple-400">Get Hired.</span>
            </motion.h1>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8"
            >
              The Agentic AI that doesn&apos;t just suggest changes—it{' '}
              <span className="text-purple-400 font-semibold">executes them</span>.
              Upload your resume, paste a job description, and watch AI rewrite,
              optimize, and render a perfect PDF.
            </motion.p>
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center"
            >
              <Link href="/signup">
                <button className="group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all font-semibold text-lg flex items-center gap-2">
                  Start For Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <Marquee speed={30} className="py-4">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </Marquee>
          </motion.div>

          {/* Bento Grid */}
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            <BentoGrid className="mb-20">
              {/* Card 1: Agentic AI */}
              <motion.div variants={fadeInUp}>
                <BentoCard colSpan="half" className="group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                      <Brain className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                        Agentic AI Fixer
                      </h3>
                      <p className="text-gray-400">
                        Not just feedback—AI <strong>executes</strong> the changes.
                        Rewrites bullets, fixes grammar, reorders sections, and
                        optimizes for ATS systems automatically.
                      </p>
                    </div>
                  </div>
                </BentoCard>
              </motion.div>

              {/* Card 2: Visual Intelligence */}
              <motion.div variants={fadeInUp}>
                <BentoCard colSpan="one" className="group">
                  <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 mb-4 w-fit">
                    <Eye className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                    Visual Intelligence
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Checks hierarchy, whitespace, and visual flow to ensure your
                    resume looks as good as it reads.
                  </p>
                </BentoCard>
              </motion.div>

              {/* Card 3: Upload & Analyze */}
              <motion.div variants={fadeInUp}>
                <BentoCard colSpan="one" className="group">
                  <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30 mb-4 w-fit">
                    <FileText className="w-8 h-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors">
                    Upload & Analyze
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Drop your old resume. We extract text, analyze gaps, and
                    identify missing keywords instantly.
                  </p>
                </BentoCard>
              </motion.div>

              {/* Card 4: PDF Generator */}
              <motion.div variants={fadeInUp}>
                <BentoCard colSpan="half" className="group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                      <Zap className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-green-400 transition-colors">
                        Generative PDF Engine
                      </h3>
                      <p className="text-gray-400">
                        Converts AI-structured data into a pixel-perfect PDF using
                        React components. Professional formatting, ATS-friendly,
                        and ready to submit.
                      </p>
                    </div>
                  </div>
                </BentoCard>
              </motion.div>

              {/* Card 5: Target Job */}
              <motion.div variants={fadeInUp}>
                <BentoCard colSpan="one" className="group">
                  <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30 mb-4 w-fit">
                    <Target className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">
                    Target Job Match
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Paste any job description. AI aligns your experience with the
                    role&apos;s requirements for maximum relevance.
                  </p>
                </BentoCard>
              </motion.div>

              {/* Card 6: How It Works */}
              <motion.div variants={fadeInUp}>
                <BentoCard colSpan="full" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <h3 className="text-3xl font-bold mb-6 text-center">
                    How It Works
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { icon: FileText, title: '1. Upload Resume', desc: 'Drop your PDF' },
                      { icon: Target, title: '2. Add Job Desc', desc: 'Paste target role' },
                      { icon: Brain, title: '3. AI Fixes', desc: 'Auto-rewrite & optimize' },
                      { icon: CheckCircle2, title: '4. Download', desc: 'Get perfect PDF' },
                    ].map((step, idx) => (
                      <div key={idx} className="text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3">
                          <step.icon className="w-8 h-8 text-purple-400" />
                        </div>
                        <h4 className="font-bold mb-1">{step.title}</h4>
                        <p className="text-sm text-gray-400">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </BentoCard>
              </motion.div>
            </BentoGrid>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <div className="inline-block px-8 py-12 rounded-3xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Get Hired in 2026?
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Join thousands of job seekers who transformed their resumes with AI.
                Start with 5 free credits—no credit card required.
              </p>
              <Link href="/signup">
                <button className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all font-bold text-lg">
                  Start Free Trial
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 ResMind 2.0. Built with Next.js 15, Supabase, and OpenAI.</p>
        </div>
      </footer>
    </div>
  );
};
