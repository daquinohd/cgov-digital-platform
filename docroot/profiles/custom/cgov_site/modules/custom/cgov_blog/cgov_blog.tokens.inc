<?php

/**
 * @file
 * {@inheritdoc}
 */

use Drupal\Core\Render\BubbleableMetadata;
use Drupal\taxonomy\Entity\Term;

/**
 * Implements hook_token_info().
 */
function cgov_blog_token_info() {
  $info = [];
  $info['types']['cgov_tokens'] = ['name' => t('Cancer.gov Tokens'), 'description' => t('Cancer.gov Tokens')];
  $info['tokens']['cgov_tokens'] = [
    'blog-post-path' => [
      'name' => t('Blog Post Path'),
      'description' => t('The computed path of a Blog Post.'),
    ],
    'blog-topic-path' => [
      'name' => t('Blog Topic Path'),
      'description' => t('The path of a Blog Topic taxonomy term.'),
    ],
  ];

  return $info;
}

/**
 * Implements hook_tokens().
 *
 * Generates a custom token which fetches a terms computed_path.
 */
function cgov_blog_tokens($type, $tokens, array $data, array $options, BubbleableMetadata $bubbleable_metadata) {
  $replacements = [];

  // Loop through tokens and set replacement values.
  foreach ($tokens as $name => $original) {
    switch ($name) {

      // Replace 'node/[nid]' with parent Site Section, year, and Pretty URL.
      case 'blog-post-path':
        if (!empty($data['node'])) {
          $replacements[$original] = _get_blog_post_path($data['node'] ?: $replacements[$original]);
        }
        break;

      default;
        break;
    }
  }

  return $replacements;
}

/**
 * Get the canonical url for a blog.
 *
 * @throws \Drupal\Core\TypedData\Exception\MissingDataException
 *   Error for missing data.
 */
function _get_blog_post_path($node) {
  $entityRepository = \Drupal::service('entity.repository');
  $lang = $node->language()->getId();
  $year = substr($node->field_date_posted->value, 0, 4);
  $path = FALSE;

  if (!empty($node->get('field_blog_series')->first())) {
    try {
      // Get the owner series and translation if exists.
      $seriesEntity = $node->field_blog_series->entity;
      $seriesEntity = $entityRepository->getTranslationFromContext($seriesEntity, $lang);

      // Get the computed path of the series and pretty URL if not empty.
      $tid = $seriesEntity->field_site_section->target_id;
      $path = Term::load($tid)->get('computed_path')->value;
      $purl = $seriesEntity->field_pretty_url->value;
      if (!empty($purl)) {
        $path .= ('/' . $purl);
      }
      // Append year.
      $path .= ('/' . $year);
    }
    catch (Exception $e) {
      \Drupal::logger('cgov_blog')
        ->notice('Could not retrieve blog computed path: ' . $path);
    }
  }
  return $path;
}
