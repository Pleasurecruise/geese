import { FormEventHandler } from 'react';

import useCommentData from '@/hooks/useCommentData';
import { useLoginContext } from '@/hooks/useLoginContext';

import Message from '@/components/message';
import Rating from '@/components/respository/Rating';

import { submitComment, submitReplyComment } from '@/services/repository';
import {
  DEFAULT_AVATAR,
  DEFAULT_INITITAL_COMMENT_DATA,
} from '@/utils/constants';

import { CommentItemData, CommentSuccessData } from '@/types/repository';

interface CommentSubmitProps {
  t: (key: string, text?: any) => string;
  belongId: string;
  className?: string;
  replyUser?: CommentItemData;
  onSuccess?: (data: CommentSuccessData) => void;
  onFail?: (error: any) => void;
  onCancelReply?: () => void;
}

function CommentSubmit(props: CommentSubmitProps) {
  const { commentData, setCommentData } = useCommentData();
  const { login, userInfo, isLogin } = useLoginContext();
  const { t, belongId, className, onSuccess, onFail } = props;

  const handleInput: FormEventHandler<HTMLTextAreaElement> = (e) => {
    const { value } = e.currentTarget;

    e.currentTarget.style.height = 'auto';
    const newHeight = Math.max(e.currentTarget.scrollHeight + 2, 58);
    e.currentTarget.style.height = `${newHeight}px`;

    setCommentData({
      ...commentData,
      comment: value,
      height: e.currentTarget.scrollHeight + 2,
    });
  };

  const handleRadioChange = (isUsed: boolean) => {
    setCommentData({ ...commentData, isUsed });
  };

  const handleChangeRating = (rating: number) => {
    setCommentData({ ...commentData, score: rating });
  };
  const getErrMessage = (commentData: {
    comment: string;
    isUsed: boolean;
    score: number;
  }) => {
    if (!commentData.comment) {
      return t('comment.submit.err1');
    }
    if (commentData.comment.length < 5) {
      return t('comment.submit.err2');
    }
    if (commentData.comment.length > 500) {
      return t('comment.submit.err3');
    }
    if (!commentData.score) {
      return t('comment.submit.err4');
    }
    return '';
  };

  const handleSubmit = () => {
    if (getErrMessage(commentData)) {
      return Message.error(getErrMessage(commentData));
    }
    if (!isLogin) {
      return login();
    }
    let request;

    if (props.replyUser) {
      request = submitReplyComment(props.replyUser.cid, {
        comment: commentData.comment,
        reply_uid: props.replyUser.user.uid,
      });
    } else {
      request = submitComment(belongId, commentData);
    }

    request
      .then((data) => {
        setCommentData(DEFAULT_INITITAL_COMMENT_DATA);

        if (data.success) {
          onSuccess && onSuccess(data);
          Message.success(t('comment.submit.success'));
        } else {
          onFail && onFail(data);
        }
      })
      .catch((err) => {
        Message.error(err.message || t('comment.submit.fail'));
      });
  };

  const placeholder = props.replyUser
    ? t('comment.submit.reply_placeholder', {
        nickname: props.replyUser.user.nickname,
      })
    : t('comment.submit.placeholder');

  return (
    <div className={`${className}`}>
      <div className='flex items-start'>
        <div className='relative mr-4 hidden sm:inline-flex'>
          <div className='relative aspect-square w-14 overflow-hidden rounded-full'>
            {!props.replyUser && (
              <img
                src={userInfo?.avatar || DEFAULT_AVATAR}
                alt='comment_submit_avatar'
              />
            )}
          </div>
        </div>
        <div className='mb-1 flex-1'>
          <textarea
            className='min-h-[3rem] w-full flex-shrink rounded-lg bg-white py-2 px-4 text-sm dark:bg-gray-800 dark:placeholder:text-gray-400 dark:focus:border-blue-800'
            style={{ height: commentData.height }}
            placeholder={placeholder}
            value={commentData.comment}
            onInput={handleInput}
          ></textarea>
          <div className='flex flex-wrap items-center gap-2 text-xs sm:gap-4 sm:text-sm'>
            {!props.replyUser && (
              <>
                <label className='flex cursor-pointer items-center py-2'>
                  <input
                    type='radio'
                    name='radio-1'
                    className='mr-1 h-3 w-3 flex-shrink-0 cursor-pointer appearance-none rounded-full border text-blue-500 focus:border-blue-500 focus:bg-blue-500'
                    style={{ boxShadow: 'none' }}
                    checked={!commentData.isUsed}
                    onChange={() => handleRadioChange(false)}
                  />
                  <span>{t('comment.unused')}</span>
                </label>
                <label className='flex cursor-pointer items-center py-2'>
                  <input
                    type='radio'
                    name='radio-1'
                    className='mr-1 h-3 w-3 flex-shrink-0 cursor-pointer appearance-none rounded-full border text-blue-500 focus:border-blue-500 focus:bg-blue-500'
                    style={{ boxShadow: 'none' }}
                    checked={commentData.isUsed}
                    onChange={() => handleRadioChange(true)}
                  />
                  <span>{t('comment.used')}</span>
                </label>
                <div className='h-4 w-[1px] bg-gray-300'></div>
                <div className='flex items-center'>
                  <span>{t('comment.score')}</span>
                  <Rating
                    value={commentData.score}
                    onRateChange={handleChangeRating}
                  />
                </div>
              </>
            )}
            <>
              {props.replyUser ? (
                <div className='flex flex-1 justify-end space-x-4'>
                  <button
                    onClick={props.onCancelReply}
                    className='inline-flex h-8 min-h-[2rem] flex-shrink-0 cursor-pointer select-none flex-wrap items-center justify-center rounded-lg border border-gray-300 pl-3 pr-3 text-sm font-semibold text-gray-500 transition-transform focus:outline-none active:scale-90'
                  >
                    {t('comment.cancel')}
                  </button>
                  <button
                    className='inline-flex h-8 min-h-[2rem] flex-shrink-0 cursor-pointer select-none flex-wrap items-center justify-center rounded-lg bg-gray-700 pl-3 pr-3 text-sm font-semibold text-white transition-transform focus:outline-none active:scale-90'
                    onClick={handleSubmit}
                  >
                    {t('comment.reply')}
                  </button>
                </div>
              ) : (
                <button
                  className='ml-auto inline-flex h-8 min-h-[2rem] flex-shrink-0 cursor-pointer select-none flex-wrap items-center justify-center rounded-lg bg-gray-700 pl-3 pr-3 text-sm font-semibold text-white transition-transform focus:outline-none active:scale-90'
                  onClick={handleSubmit}
                >
                  {t('comment.submit.save')}
                </button>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentSubmit;
