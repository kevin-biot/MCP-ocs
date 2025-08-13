#!/bin/bash

# Daily Regression - Quick feature validation
echo "📅 Daily Regression Check"
echo "========================"

# Quick unit tests
npm run test:unit -- --passWithNoTests --silent

# Security validation
npm run test:unit -- --testNamePattern="validation|security" --silent

echo "✅ Daily regression complete"

