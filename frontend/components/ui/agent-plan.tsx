"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

interface Subtask {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "need-help" | "failed";
  tools?: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "need-help" | "failed";
  priority?: string;
  level?: number;
  dependencies?: string[];
  model?: string;
  subtasks: Subtask[];
}

interface AgentPlanProps {
  tasks: Task[];
  onTasksChange?: (tasks: Task[]) => void;
  defaultExpandedTasks?: string[];
}

export function AgentPlan({ tasks: initialTasks, onTasksChange, defaultExpandedTasks }: AgentPlanProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expandedTasks, setExpandedTasks] = useState<string[]>(
    defaultExpandedTasks || initialTasks.filter(t => t.status === "in-progress").map(t => t.id)
  );
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    setTasks(initialTasks);
    const inProgressTasks = initialTasks.filter(t => t.status === "in-progress").map(t => t.id);
    setExpandedTasks(prev => [...new Set([...prev, ...inProgressTasks])]);
  }, [initialTasks]);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    }
  }, []);

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const taskVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: prefersReducedMotion ? "tween" : "spring", 
        stiffness: 500, 
        damping: 30,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -5,
      transition: { duration: 0.15 }
    }
  };

  const subtaskListVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" as const },
    visible: { 
      height: "auto",
      opacity: 1,
      overflow: "visible" as const,
      transition: { 
        duration: 0.25, 
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        when: "beforeChildren" as const,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      overflow: "hidden" as const,
      transition: { duration: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }
    }
  };

  const subtaskVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: prefersReducedMotion ? "tween" : "spring", 
        stiffness: 500, 
        damping: 25,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    },
    exit: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : -10,
      transition: { duration: 0.15 }
    }
  };

  const subtaskDetailsVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" as const },
    visible: { 
      opacity: 1, 
      height: "auto",
      overflow: "visible" as const,
      transition: { duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }
    }
  };

  const statusBadgeVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: prefersReducedMotion ? 1 : [1, 1.08, 1],
      transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }
    }
  };

  const getStatusIcon = (status: string, size: "sm" | "md" = "md") => {
    const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
    
    switch (status) {
      case "completed":
        return <CheckCircle2 className={`${sizeClass} text-[#76B900]`} />;
      case "in-progress":
        return <CircleDotDashed className={`${sizeClass} text-blue-400 animate-spin`} style={{ animationDuration: '3s' }} />;
      case "need-help":
        return <CircleAlert className={`${sizeClass} text-amber-400`} />;
      case "failed":
        return <CircleX className={`${sizeClass} text-red-400`} />;
      default:
        return <Circle className={`${sizeClass} text-white/20`} />;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#76B900]/20 text-[#76B900]";
      case "in-progress":
        return "bg-blue-500/20 text-blue-400";
      case "need-help":
        return "bg-amber-500/20 text-amber-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-white/10 text-white/40";
    }
  };

  return (
    <div className="text-white h-full overflow-auto">
      <motion.div 
        className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] } }}
      >
        <LayoutGroup>
          <div className="p-4 overflow-hidden">
            <ul className="space-y-1 overflow-hidden">
              {tasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === "completed";
                const hasSubtasks = task.subtasks && task.subtasks.length > 0;

                return (
                  <motion.li
                    key={task.id}
                    className={`${index !== 0 ? "mt-1 pt-2 border-t border-white/[0.05]" : ""}`}
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    <motion.div 
                      className="group flex items-center px-3 py-2 rounded-lg cursor-pointer"
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)", transition: { duration: 0.2 } }}
                      onClick={() => hasSubtasks && toggleTaskExpansion(task.id)}
                    >
                      {hasSubtasks && (
                        <motion.div
                          className="mr-2 text-white/30"
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.div>
                      )}
                      
                      <motion.div className="mr-3 flex-shrink-0">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={task.status}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            transition={{ duration: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
                          >
                            {getStatusIcon(task.status)}
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>

                      <div className="flex min-w-0 flex-grow items-center justify-between">
                        <div className="mr-2 flex-1">
                          <span
                            className={`font-medium text-sm ${
                              isCompleted 
                                ? "text-white/50 line-through" 
                                : task.status === "in-progress" 
                                  ? "text-white" 
                                  : "text-white/70"
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.model && (
                            <span className="ml-2 font-mono text-xs text-[#76B900] bg-[#76B900]/8 px-2 py-0.5 rounded">
                              {task.model}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                          <motion.span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeStyle(task.status)}`}
                            variants={statusBadgeVariants}
                            initial="initial"
                            animate="animate"
                            key={task.status}
                          >
                            {task.status === "in-progress" ? "running" : task.status}
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {isExpanded && hasSubtasks && (
                        <motion.div 
                          className="relative overflow-hidden"
                          variants={subtaskListVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          layout
                        >
                          <div className="absolute top-0 bottom-0 left-[28px] border-l border-dashed border-white/10" />
                          <ul className="mt-1 mr-2 mb-1.5 ml-6 space-y-0.5">
                            {task.subtasks.map((subtask) => {
                              const subtaskKey = `${task.id}-${subtask.id}`;
                              const isSubtaskExpanded = expandedSubtasks[subtaskKey];

                              return (
                                <motion.li
                                  key={subtask.id}
                                  className="group flex flex-col py-0.5 pl-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSubtaskExpansion(task.id, subtask.id);
                                  }}
                                  variants={subtaskVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  layout
                                >
                                  <motion.div 
                                    className="flex flex-1 items-center rounded-md p-1.5 cursor-pointer"
                                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)", transition: { duration: 0.2 } }}
                                    layout
                                  >
                                    <motion.div className="mr-2 flex-shrink-0" layout>
                                      <AnimatePresence mode="wait">
                                        <motion.div
                                          key={subtask.status}
                                          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                                          transition={{ duration: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
                                        >
                                          {getStatusIcon(subtask.status, "sm")}
                                        </motion.div>
                                      </AnimatePresence>
                                    </motion.div>

                                    <span
                                      className={`text-sm ${
                                        subtask.status === "completed" 
                                          ? "text-white/40 line-through" 
                                          : subtask.status === "in-progress"
                                            ? "text-white/70"
                                            : "text-white/50"
                                      }`}
                                    >
                                      {subtask.title}
                                    </span>
                                  </motion.div>

                                  <AnimatePresence mode="wait">
                                    {isSubtaskExpanded && (
                                      <motion.div 
                                        className="text-white/50 border-l border-dashed border-white/10 mt-1 ml-1.5 pl-5 text-xs overflow-hidden"
                                        variants={subtaskDetailsVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        layout
                                      >
                                        <p className="py-1">{subtask.description}</p>
                                        {subtask.tools && subtask.tools.length > 0 && (
                                          <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1.5">
                                            <span className="text-white/40 font-medium">Tools:</span>
                                            <div className="flex flex-wrap gap-1">
                                              {subtask.tools.map((tool, idx) => (
                                                <motion.span
                                                  key={idx}
                                                  className="bg-white/8 text-white/60 rounded px-1.5 py-0.5 text-[10px] font-medium"
                                                  initial={{ opacity: 0, y: -5 }}
                                                  animate={{ opacity: 1, y: 0, transition: { duration: 0.2, delay: idx * 0.05 } }}
                                                  whileHover={{ backgroundColor: "rgba(118, 185, 0, 0.2)", color: "#76B900", transition: { duration: 0.2 } }}
                                                >
                                                  {tool}
                                                </motion.span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}

export type { Task, Subtask };
