<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'Public Use' text block.
 *
 * @Block(
 *  id = "cgov_public_use",
 *  admin_label = @Translation("Cgov Public Use"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class PublicUse extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_core.cgov_navigation_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $page_title = 'DEBUG page title';

    $build = [
      '#theme' => 'cgov_common',
      '#type' => 'block',
      'page_title' => $page_title,
    ];
    return $build;
  }

}
