"""
File validation utilities for secure file uploads.
"""
import os
import magic
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator


# File size limits (in bytes)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Allowed MIME types for different file categories
ALLOWED_DOCUMENT_MIMES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # .docx
]


def validate_file_size(file):
    """
    Validate that file size does not exceed the maximum limit.

    Args:
        file: Django UploadedFile object

    Raises:
        ValidationError: If file size exceeds MAX_FILE_SIZE
    """
    if file.size > MAX_FILE_SIZE:
        max_size_mb = MAX_FILE_SIZE / (1024 * 1024)
        raise ValidationError(
            f'File size {file.size / (1024 * 1024):.2f}MB exceeds maximum allowed size of {max_size_mb}MB.'
        )


def validate_file_content(file, allowed_mimes=None):
    """
    Validate file content using libmagic (not just extension).

    This provides security by checking the actual file content,
    not just trusting the file extension.

    Args:
        file: Django UploadedFile object
        allowed_mimes: List of allowed MIME types (defaults to ALLOWED_DOCUMENT_MIMES)

    Raises:
        ValidationError: If file content type is not allowed
    """
    if allowed_mimes is None:
        allowed_mimes = ALLOWED_DOCUMENT_MIMES

    # Read file content to determine MIME type
    file.seek(0)  # Ensure we're at the start of the file
    file_content = file.read(2048)  # Read first 2KB for MIME detection
    file.seek(0)  # Reset file pointer for later use

    # Use libmagic to detect actual MIME type
    mime = magic.from_buffer(file_content, mime=True)

    if mime not in allowed_mimes:
        raise ValidationError(
            f'File type "{mime}" is not allowed. Allowed types: {", ".join(allowed_mimes)}'
        )


def validate_submission_file(file):
    """
    Validate submission file (PDF, DOC, DOCX only).

    Args:
        file: Django UploadedFile object

    Raises:
        ValidationError: If file is invalid
    """
    # Validate file size
    validate_file_size(file)

    # Validate file content (MIME type)
    validate_file_content(file, ALLOWED_DOCUMENT_MIMES)

    # Additional check: validate file extension matches expected extensions
    allowed_extensions = ['pdf', 'doc', 'docx']
    ext = os.path.splitext(file.name)[1][1:].lower()
    if ext not in allowed_extensions:
        raise ValidationError(
            f'File extension ".{ext}" is not allowed. Allowed extensions: {", ".join(allowed_extensions)}'
        )


def validate_assignment_file(file):
    """
    Validate assignment attachment file (PDF, DOC, DOCX only).

    Args:
        file: Django UploadedFile object

    Raises:
        ValidationError: If file is invalid
    """
    # Same validation as submission files
    validate_submission_file(file)


def validate_feedback_file(file):
    """
    Validate feedback attachment file (PDF, DOC, DOCX only).

    Args:
        file: Django UploadedFile object

    Raises:
        ValidationError: If file is invalid
    """
    # Same validation as submission files
    validate_submission_file(file)
