<?php

/**
 * @file
 * {@inheritdoc}
 */

use Drupal\Core\Render\BubbleableMetadata;

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
 *
 * @throws \Drupal\Core\TypedData\Exception\MissingDataException
 *   Error for missing data.
 */
function cgov_blog_tokens($type, $tokens, array $data, array $options, BubbleableMetadata $bubbleable_metadata) {
  $replacements = [];
  foreach ($tokens as $name => $original) {
    switch ($name) {

      /*
       * Replace 'node/[nid]' with parent Site Section, year, and Pretty URL.
       * TODO: Refactor/clean up.
       */
      case 'blog-post-path':
        if (!empty($data['node'])) {
          $node = $data['node'];
          if (!empty($node->get('field_blog_series')->first())) {
            try {
              $nid = $node->get('field_blog_series')->first()->getValue()['target_id'];
              $alias = \Drupal::service('path.alias_manager')->getAliasByPath('/node/' . $nid);
              $year = substr($node->field_date_posted->value, 0, 4);
              $replacements[$original] = $alias . '/' . $year;
            }
            catch (Exception $e) {
              \Drupal::logger('cgov_site_section')
                ->notice('Could not retrieve computed path for Blog Series nid: ' . $nid);
            }
          }
        }
        break;

      // Replace 'taxonomy/term/[tid]' with owner Site Section and Pretty URL.
      case 'blog-topic-path':
        if (!empty($data['term'])) {
          $term = $data['term'];
          if (!empty($term->field_pretty_url->value)) {
            try {
              $nid = $term->get('field_owner_blog')->first()->getValue()['target_id'];
              $name = $term->field_pretty_url->value;
              $alias = \Drupal::service('path.alias_manager')->getAliasByPath('/node/' . $nid);
              $replacements[$original] = $alias . '/' . $name;
            }
            catch (Exception $e) {
              \Drupal::logger('cgov_site_section')
                ->notice('Could not retrieve computed path for Blog Topic nid: ' . $nid);
            }
          }
        }
        break;

    }
  }
  return $replacements;
}
