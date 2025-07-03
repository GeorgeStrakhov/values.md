// API endpoint for managing experiment templates and configurations

import { NextRequest, NextResponse } from 'next/server';
import { getTemplateMetadata } from '@/lib/values-templates';
import { experimentConfigs, evaluationMetrics } from '@/lib/experiment-framework';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'templates':
        // Return available template metadata
        return NextResponse.json({
          templates: getTemplateMetadata()
        });

      case 'experiments':
        // Return available experiment configurations
        return NextResponse.json({
          experiments: experimentConfigs.map(config => ({
            id: config.id,
            name: config.name,
            description: config.description,
            templates: config.templates,
            sampleSize: config.sampleSize,
            durationDays: config.durationDays,
            metricCount: config.evaluationMetrics.length
          }))
        });

      case 'metrics':
        // Return evaluation metrics
        return NextResponse.json({
          metrics: evaluationMetrics
        });

      default:
        // Return all experiment framework info
        return NextResponse.json({
          templates: getTemplateMetadata(),
          experiments: experimentConfigs.map(config => ({
            id: config.id,
            name: config.name,
            description: config.description,
            templates: config.templates,
            sampleSize: config.sampleSize,
            durationDays: config.durationDays,
            metricCount: config.evaluationMetrics.length
          })),
          metrics: evaluationMetrics
        });
    }
  } catch (error) {
    console.error('Error retrieving experiment configuration:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve experiment configuration' },
      { status: 500 }
    );
  }
}